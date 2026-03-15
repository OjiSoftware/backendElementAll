// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { prisma } from "../prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendOrderConfirmationEmail } from "../services/email.service";

const clientMP = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "",
});

/**
 * 1. POST /api/payments/create-preference
 * Agarra la venta creada y pide el link a Mercado Pago.
 * AHORA: Valida stock real antes de permitir el pago.
 */
import { reserveStock, insertGuestSale } from "../repositories/sale.repository";

export const createPreference = async (req: Request, res: Response) => {
    try {
        const { saleId, clientData, items, total } = req.body;

        let sale;

        // 1. Si no hay saleId, es la primera vez que tocan "Pagar" -> Creamos la Orden
        if (!saleId && clientData && items) {
            sale = await insertGuestSale(clientData, items, total);
        } else if (saleId) {
            sale = await prisma.sale.findUnique({
                where: { id: Number(saleId) },
                include: {
                    details: { include: { product: true } },
                    client: true,
                },
            });
        }

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // 2. RESERVA DE STOCK: Si no está reservado, reservamos ahora (atómico)
        if (!sale.isStockDeducted) {
            try {
                // Actualizamos la variable 'sale' con la info del stock reservado
                sale = await reserveStock(sale.id);
            } catch (stockError: any) {
                return res.status(400).json({
                    error: "Stock insuficiente",
                    details: stockError.message,
                });
            }
        }

        // 3. Crear Transacción (para seguimiento)
        await prisma.transaction.upsert({
            where: { saleId: sale.id },
            update: {
                amount: sale.total,
                status: "pending",
            },
            create: {
                saleId: sale.id,
                clientId: sale.clientId,
                amount: sale.total,
                status: "pending",
            },
        });

        const mappedItems = (sale as any).details.map((detail: any) => ({
            id: detail.productId,
            title: detail.product?.name || "Producto",
            unit_price: Number(detail.unitaryPrice),
            quantity: Number(detail.quantity),
        }));

        const paymentService = new PaymentService();
        const mpResult = await paymentService.createPreference(
            mappedItems,
            String(sale.id),
            (sale as any).client.email,
        );

        res.status(200).json({
            preferenceId: mpResult.id,
            initPoint: mpResult.init_point,
            saleId: sale.id, // Devolvemos el ID por si se acaba de crear
        });
    } catch (error) {
        const err = error as Error;
        console.error("❌ Error en createPreference:", err.message);
        res.status(500).json({
            error: "Internal server error",
            details: err.message,
        });
    }
};

/**
 * 2. POST /api/payments/webhook
 * Recibe el aviso de pago, actualiza DB y descuenta stock atómicamente.
 */
export const handleWebhook = async (req: Request, res: Response) => {
    res.status(200).send("OK"); // Respondemos rápido para que MP no reintente

    try {
        const type = req.body.type || req.query.type;
        const dataId = req.body.data?.id || req.query["data.id"];

        if (type === "payment" && dataId) {
            console.log(`🔎 Procesando notificación de pago: ${dataId}`);

            const payment = new Payment(clientMP);
            const paymentData = await payment.get({ id: dataId });

            if (paymentData.external_reference) {
                const saleId = parseInt(paymentData.external_reference);

                const existingTransaction = await prisma.transaction.findUnique(
                    {
                        where: { saleId: saleId },
                    },
                );

                if (existingTransaction?.status === "approved") {
                    console.log(
                        "⚠️ Esta venta ya fue procesada anteriormente.",
                    );
                    return;
                }

                if (paymentData.status === "approved") {
                    const saleWithDetails = await prisma.sale.findUnique({
                        where: { id: saleId },
                        include: { details: true },
                    });

                    if (!saleWithDetails) return;

                    // ¿Qué pasa si MP avisa tarde y el cron ya la canceló?
                    if (saleWithDetails.status === "CANCELLED") {
                        console.log(
                            `🚨 ALERTA CRÍTICA: La venta ${saleId} se pagó TARDE y el CronJob ya la había cancelado.`,
                        );

                        // Solo registramos que la plata de Mercado Pago entró (para contabilidad)
                        await prisma.transaction.update({
                            where: { saleId: saleId },
                            data: {
                                status: "approved",
                                mpId: paymentData.id?.toString(),
                                paymentMethod: paymentData.payment_method_id,
                                paymentType: paymentData.payment_type_id,
                            },
                        });

                        // IMPORTANTE: No marcamos la venta como COMPLETADA ni restamos stock.
                        // La plata entró, pero el inventario está a salvo. Requiere revisión manual.
                        console.log(
                            `🛑 Se registró el pago #${dataId} en transacción, pero la VENTA #${saleId} queda CANCELADA.`,
                        );
                        return; // Cortamos la ejecución acá.
                    }

                    // IMPORTANTE: Solo descontamos si NO se descontó antes
                    if (!saleWithDetails.isStockDeducted) {
                        const stockUpdates = saleWithDetails.details.map(
                            (detail) =>
                                prisma.product.update({
                                    where: { id: detail.productId },
                                    data: {
                                        stock: { decrement: detail.quantity },
                                    },
                                }),
                        );

                        // 1. Transacción de Base de Datos
                        await prisma.$transaction([
                            prisma.transaction.update({
                                where: { saleId: saleId },
                                data: {
                                    status: "approved",
                                    mpId: paymentData.id?.toString(),
                                    paymentMethod:
                                        paymentData.payment_method_id,
                                    paymentType: paymentData.payment_type_id,
                                    cardLastFour:
                                        paymentData.card?.last_four_digits,
                                },
                            }),
                            prisma.sale.update({
                                where: { id: saleId },
                                data: {
                                    status: "COMPLETED",
                                    isStockDeducted: true,
                                }, // Se marca como descontado
                            }),
                            ...stockUpdates,
                        ]);

                        console.log(
                            `✅ Venta ${saleId} cobrada y stock descontado.`,
                        );
                    } else {
                        // Ya estaba descontado (raro, pero como protección)
                        await prisma.$transaction([
                            prisma.transaction.update({
                                where: { saleId: saleId },
                                data: {
                                    status: "approved",
                                    mpId: paymentData.id?.toString(),
                                    paymentMethod:
                                        paymentData.payment_method_id,
                                    paymentType: paymentData.payment_type_id,
                                    cardLastFour:
                                        paymentData.card?.last_four_digits,
                                },
                            }),
                            prisma.sale.update({
                                where: { id: saleId },
                                data: { status: "COMPLETED" },
                            }),
                        ]);
                        console.log(
                            `✅ Venta ${saleId} cobrada (Stock ya había sido descontado).`,
                        );
                    }

                    // 2. ENVÍO DE MAIL DE CONFIRMACIÓN
                    // Buscamos la data con los nombres de productos y la dirección histórica
                    const fullSaleInfo = await prisma.sale.findUnique({
                        where: { id: saleId },
                        include: {
                            client: true,
                            address: true,
                            details: {
                                include: { product: true },
                            },
                        },
                    });

                    if (fullSaleInfo && fullSaleInfo.client.email) {
                        // Extraemos la información del pago directo de Mercado Pago
                        const paymentInfo = {
                            id: paymentData.id || "N/A",
                            method:
                                paymentData.payment_method_id || "Desconocido",
                            type: paymentData.payment_type_id || "Desconocido",
                            lastFour:
                                paymentData.card?.last_four_digits || null,
                        };

                        // Ejecución asíncrona para evitar bloqueo del hilo principal
                        sendOrderConfirmationEmail(
                            fullSaleInfo.client.email,
                            fullSaleInfo,
                            paymentInfo,
                        )
                            .then(() =>
                                console.log(
                                    `📧 Notificacion de confirmacion enviada a: ${fullSaleInfo.client.email}`,
                                ),
                            )
                            .catch((err) =>
                                console.error(
                                    "❌ Error en envio de notificacion de confirmacion:",
                                    err,
                                ),
                            );
                    }
                } else if (
                    paymentData.status === "rejected" ||
                    paymentData.status === "cancelled"
                ) {
                    await prisma.transaction.update({
                        where: { saleId: saleId },
                        data: {
                            status: "rejected",
                            mpId: paymentData.id?.toString(),
                        },
                    });
                    console.log(
                        `❌ Pago rechazado/cancelado para la venta ${saleId}.`,
                    );
                }
            }
        }
    } catch (error) {
        const err = error as Error;
        console.error("❌ Error crítico en Webhook:", err.message);
    }
};
