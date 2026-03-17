import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service";
import { prisma } from "../prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { sendOrderConfirmationEmail } from "../services/email.service";
import { reserveStock, insertGuestSale } from "../repositories/sale.repository";

const clientMP = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export const createPreference = async (req: Request, res: Response) => {
    try {
        const { saleId, clientData, items, total } = req.body;

        let sale;

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

        // Si es una venta vieja (CANCELLED), no dejamos que vuelva a pagar
        if (sale.status === "CANCELLED") {
            return res
                .status(400)
                .json({
                    error: "Esta venta ha expirado y ya no puede ser pagada",
                });
        }

        if (!sale.isStockDeducted) {
            try {
                sale = await reserveStock(sale.id);
            } catch (stockError: any) {
                return res.status(400).json({
                    error: "Stock insuficiente",
                    details: stockError.message,
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

        const mappedItems = (sale as any).details.map((detail: any) => ({
            id: detail.productId,
            title: detail.product?.name || "Producto",
            unit_price: Number(detail.unitaryPrice),
            quantity: Number(detail.quantity),
        }));

        const paymentService = new PaymentService();

        const expirationDate =
            sale.expiresAt || new Date(Date.now() + 10 * 60000);

        const mpResult = await paymentService.createPreference(
            mappedItems,
            String(sale.id),
            expirationDate,
            (sale as any).client.email,
        );

        res.status(200).json({
            preferenceId: mpResult.id,
            initPoint: mpResult.init_point,
            saleId: sale.id,
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

export const handleWebhook = async (req: Request, res: Response) => {
    res.status(200).send("OK");

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

                    // --- VENTA CANCELADA PERO PAGADA ---
                    if (saleWithDetails.status === "CANCELLED") {
                        console.log(
                            `🚨 ALERTA CRÍTICA: La venta ${saleId} se pagó TARDE y el CronJob ya la había cancelado.`,
                        );

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
                                    notes: `[SISTEMA]: Pago MP #${dataId} recibido fuera de término. Revisar stock manualmente o reembolsar.`,
                                },
                            }),
                        ]);

                        console.log(
                            `🛑 Se registró el pago #${dataId} en transacción, pero la VENTA #${saleId} queda CANCELADA con nota.`,
                        );
                        return;
                    }

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
                                },
                            }),
                            ...stockUpdates,
                        ]);

                        console.log(
                            `✅ Venta ${saleId} cobrada y stock descontado.`,
                        );
                    } else {
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

                    // ENVÍO DE MAIL DE CONFIRMACIÓN
                    const fullSaleInfo = await prisma.sale.findUnique({
                        where: { id: saleId },
                        include: {
                            client: true,
                            address: true,
                            details: { include: { product: true } },
                        },
                    });

                    if (fullSaleInfo && fullSaleInfo.client.email) {
                        const paymentInfo = {
                            id: paymentData.id || "N/A",
                            method:
                                paymentData.payment_method_id || "Desconocido",
                            type: paymentData.payment_type_id || "Desconocido",
                            lastFour:
                                paymentData.card?.last_four_digits || null,
                        };

                        sendOrderConfirmationEmail(
                            fullSaleInfo.client.email,
                            fullSaleInfo,
                            paymentInfo,
                        )
                            .then(() =>
                                console.log(
                                    `📧 Notificacion enviada a: ${fullSaleInfo.client.email}`,
                                ),
                            )
                            .catch((err) =>
                                console.error(
                                    "❌ Error en envio de notificacion:",
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
