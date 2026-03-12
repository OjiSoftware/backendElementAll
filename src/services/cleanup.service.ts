import { prisma } from "../prisma";

/**
 * Servicio para limpiar ventas expiradas y devolver stock.
 * Se ejecuta periódicamente.
 */
export const startCleanupTask = () => {
    // Ejecutar cada 1 minuto
    setInterval(async () => {
        try {
            const now = new Date();

            // 1. Buscar ventas pendientes expiradas con stock descontado
            const expiredSales = await prisma.sale.findMany({
                where: {
                    status: "PENDING",
                    isStockDeducted: true,
                    expiresAt: {
                        lt: now,
                    },
                },
                include: {
                    details: true,
                },
            });

            if (expiredSales.length === 0) return;

            console.log(`🧹 Limpiando ${expiredSales.length} ventas expiradas...`);

            for (const sale of expiredSales) {
                await prisma.$transaction(async (tx) => {
                    // Devolver stock
                    for (const detail of sale.details) {
                        await tx.product.update({
                            where: { id: detail.productId },
                            data: { stock: { increment: detail.quantity } },
                        });
                    }

                    // Cancelar venta y marcar que el stock ya no esta deducido
                    await tx.sale.update({
                        where: { id: sale.id },
                        data: {
                            status: "CANCELLED",
                            isStockDeducted: false,
                        },
                    });
                });
                console.log(`✅ Venta #${sale.id} cancelada por expiración.`);
            }
        } catch (error) {
            console.error("❌ Error en cleanup task:", error);
        }
    }, 60000); // 1 minuto
};
