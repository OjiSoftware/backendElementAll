import { prisma } from "../prisma";

/**
 * Servicio para limpiar ventas expiradas y devolver stock.
 * Se ejecuta de forma recursiva cada 1 minuto.
 */
export const startCleanupTask = () => {
    const run = async () => {
        try {
            const now = new Date();

            // 1. Buscar ventas pendientes expiradas con stock descontado
            const expiredSales = await prisma.sale.findMany({
                where: {
                    status: "PENDING",
                    isStockDeducted: true,
                    expiresAt: { lt: now },
                },
                include: { details: true },
            });

            if (expiredSales.length === 0) return; // Sale del try, va al finally y espera 1 min

            console.log(
                `🧹 Limpiando ${expiredSales.length} ventas expiradas...`,
            );

            for (const sale of expiredSales) {
                // Try/Catch individual: Si falla una venta, las demás se siguen limpiando
                try {
                    await prisma.$transaction(async (tx) => {
                        // PROTECCIÓN ANTI-WEBHOOK (Race Condition)
                        // Volvemos a consultar la venta ya dentro del bloqueo de la transacción
                        const currentSale = await tx.sale.findUnique({
                            where: { id: sale.id },
                            select: { status: true },
                        });

                        // Si MP ya la aprobó en este milisegundo, abortamos esta cancelación
                        if (currentSale?.status !== "PENDING") {
                            console.log(
                                `⚠️ Venta #${sale.id} cambió de estado. Omitiendo limpieza.`,
                            );
                            return;
                        }

                        // 2. Devolver stock
                        for (const detail of sale.details) {
                            await tx.product.update({
                                where: { id: detail.productId },
                                data: { stock: { increment: detail.quantity } },
                            });
                        }

                        // 3. Cancelar venta y marcar que el stock ya no está deducido
                        await tx.sale.update({
                            where: { id: sale.id },
                            data: {
                                status: "CANCELLED",
                                isStockDeducted: false,
                            },
                        });

                        // 4. Cerrar la transacción asociada pasándola a rechazada
                        // Usamos updateMany para que no frene el script si por algún error raro la transacción no existe
                        await tx.transaction.updateMany({
                            where: { saleId: sale.id },
                            data: {
                                status: "rejected",
                            },
                        });
                    });

                    console.log(
                        `✅ Venta #${sale.id} cancelada y transacción rechazada por expiración.`,
                    );
                } catch (txError) {
                    console.error(
                        `❌ Error aislado al limpiar la venta #${sale.id}:`,
                        txError,
                    );
                }
            }
        } catch (error) {
            // Este catch atrapa caídas grandes (ej: Prisma no conecta a la DB)
            console.error("❌ Error crítico en cleanup task:", error);
        } finally {
            // Garantizamos que SIEMPRE se programe la próxima vuelta, pase lo que pase
            setTimeout(run, 60000);
        }
    };

    // Iniciamos la primera ejecución apenas levanta el servidor
    run();
};
