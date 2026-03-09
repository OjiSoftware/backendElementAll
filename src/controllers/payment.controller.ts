import { Request, Response } from "express";
import { PaymentService } from "../services/payment.service"; // Ajustá la ruta según tu carpeta
import { prisma } from "../prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Reutilizamos el cliente de MP para el webhook
const clientMP = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || "",
});

/**
 * Endpoint: POST /api/payments/create-preference
 */
export const createPreference = async (req: Request, res: Response) => {
    try {
        const { saleId } = req.body;

        // 1. Buscamos la venta en la DB
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

        // 2. Transacción de respaldo en Prisma
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

        // 3. Mapeamos los items al formato que pide nuestro Service
        const mappedItems = sale.details.map((detail) => ({
            id: detail.productId,
            title: detail.product.name,
            unit_price: Number(detail.unitaryPrice),
            quantity: Number(detail.quantity),
        }));

        // 4. Delegamos la creación a Mercado Pago usando el Service
        const paymentService = new PaymentService();
        const mpResult = await paymentService.createPreference(
            mappedItems,
            String(sale.id),
            sale.client.email,
        );

        // 5. Respondemos al frontend con el ID y el link de pago
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
 * Endpoint: POST /api/payments/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
    // 1. Respondemos 200 OK inmediatamente a MP
    res.status(200).send("OK");

    try {
        const type = req.body.type || req.query.type;
        const dataId = req.body.data?.id || req.query["data.id"];

        if (type === "payment" && dataId) {
            console.log(`🔎 Procesando notificación de pago: ${dataId}`);

            // 2. Consultamos el estado real del pago con el SDK
            const payment = new Payment(clientMP);
            const paymentData = await payment.get({ id: dataId });

            if (paymentData.external_reference) {
                const saleId = parseInt(paymentData.external_reference);

                // 3. Control de Idempotencia (Evitar procesar dos veces)
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

                // 4. Lógica de negocio según el estado del pago
                if (paymentData.status === "approved") {
                    // 🔥 ACÁ ENTRA LA LÓGICA NUEVA DE STOCK 🔥
                    // Buscamos los detalles de la venta para saber qué descontar
                    const saleWithDetails = await prisma.sale.findUnique({
                        where: { id: saleId },
                        include: { details: true },
                    });

                    if (!saleWithDetails) return;

                    // Preparamos las operaciones de actualización de stock
                    const stockUpdates = saleWithDetails.details.map((detail) =>
                        prisma.product.update({
                            where: { id: detail.productId },
                            data: {
                                stock: {
                                    decrement: detail.quantity, // Prisma resta automáticamente
                                },
                            },
                        }),
                    );

                    // Ejecutamos todo junto: Transacción MP, Venta y Stock
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
                        ...stockUpdates, // Desplegamos todas las restas de stock acá
                    ]);

                    console.log(
                        `✅ Venta ${saleId} cobrada y stock descontado.`,
                    );
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
                        `❌ Pago rechazado o cancelado para la venta ${saleId}.`,
                    );
                }
            }
        }
    } catch (error) {
        const err = error as Error;
        console.error("❌ Error crítico en Webhook:", err.message);
    }
};
