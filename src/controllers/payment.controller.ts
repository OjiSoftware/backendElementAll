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
export const createPreference = async (req: Request, res: Response) => {
    try {
        const { saleId } = req.body;

        const sale = await prisma.sale.findUnique({
            where: { id: Number(saleId) },
            include: {
                details: { include: { product: true } },
                client: true,
            },
        });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // 🔥 PROTECCIÓN DE STOCK: Validamos cada producto antes de ir a MP
        for (const detail of sale.details) {
            // Buscamos el stock más fresco de la DB
            const freshProduct = await prisma.product.findUnique({
                where: { id: detail.productId },
                select: { stock: true, name: true },
            });

            if (!freshProduct) {
                return res.status(404).json({
                    error: `El producto ${detail.product.name} ya no existe.`,
                });
            }

            if (freshProduct.stock < detail.quantity) {
                return res.status(400).json({
                    error: "Stock insuficiente",
                    details: `Lo sentimos, el producto "${freshProduct.name}" se quedó sin stock suficiente (Quedan: ${freshProduct.stock}).`,
                });
            }
        }

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

        const mappedItems = sale.details.map((detail) => ({
            id: detail.productId,
            title: detail.product.name,
            unit_price: Number(detail.unitaryPrice),
            quantity: Number(detail.quantity),
        }));

        const paymentService = new PaymentService();
        const mpResult = await paymentService.createPreference(
            mappedItems,
            String(sale.id),
            sale.client.email,
        );

        res.status(200).json({
            preferenceId: mpResult.id,
            initPoint: mpResult.init_point,
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

                    // IMPORTANTE: Solo descontamos si NO se descontó antes
                    if (!saleWithDetails.isStockDeducted) {
                        const stockUpdates = saleWithDetails.details.map((detail) =>
                            prisma.product.update({
                                where: { id: detail.productId },
                                data: { stock: { decrement: detail.quantity } },
                            }),
                        );

                        // 1. Transacción de Base de Datos
                        await prisma.$transaction([
                            prisma.transaction.update({
                                where: { saleId: saleId },
                                data: {
                                    status: "approved",
                                    mpId: paymentData.id?.toString(),
                                },
                            }),
                            prisma.sale.update({
                                where: { id: saleId },
                                data: { status: "COMPLETED", isStockDeducted: true }, // Se marca como descontado
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
                                },
                            }),
                            prisma.sale.update({
                                where: { id: saleId },
                                data: { status: "COMPLETED" },
                            }),
                        ]);
                        console.log(`✅ Venta ${saleId} cobrada (Stock ya había sido descontado).`);
                    }



                    // 📧 2. ENVÍO DE MAIL DE CONFIRMACIÓN
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
                            paymentInfo, // 🔥 Le pasamos el tercer parámetro acá
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
