// src/repositories/sale.repository.ts
import { prisma } from "../prisma";
import { Sale as SaleModel, SaleDetails as SaleDetailsModel } from "../generated/prisma/client";
import { CreateSaleInput, UpdateSaleInput } from "../types/sale.types";


/**
 * Obtiene todas las ventas de la base de datos.
 * @returns Array de ventas.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllSales = async (): Promise<SaleModel[]> => {
    try {
        return await prisma.sale.findMany({
            include: { details: true },
            orderBy: { id: "desc" },
        });
    } catch (error) {
        console.error("Error al obtener ventas:", error);
        throw new Error("No se pudieron obtener las ventas");
    }
};

/**
 * Busca una venta por su ID.
 * @param id - ID de la venta a buscar.
 * @returns Venta encontrada o null si no existe.
 * @throws Error si falla la consulta.
 */
export const findSaleById = async (id: number): Promise<SaleModel | null> => {
    try {
        return await prisma.sale.findUnique({
            where: { id },
            include: { details: true },
        });
    } catch (error) {
        console.error(`Error al buscar venta con id ${id}:`, error);
        throw new Error("No se pudo obtener la venta");
    }
};

/**
 * Crea una nueva venta en la base de datos.
 * @param data - Objeto con los datos de la venta y sus detalles.
 * @returns Venta recién creada.
 * @throws Error si falla la inserción.
 */
export const insertSale = async (data: CreateSaleInput): Promise<SaleModel> => {
    try {
        return await prisma.$transaction(async (tx) => {
            // 1. Extraemos IDs únicos para consultar la BD
            const productIds = data.details.map((d) => d.productId);

            // 2. BATCH QUERY: Traemos todos los productos de una sola vez
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, price: true, stock: true, name: true } // Solo lo necesario
            });

            // Creamos un mapa para acceso O(1)
            const productMap = new Map(products.map((p) => [p.id, p]));

            const detailsWithPrices = [];
            const stockUpdatePromises = []; // Cola de promesas para el stock
            let totalAmount = 0;

            // 3. Procesamiento en memoria (Sin esperas de BD en el bucle)
            for (const item of data.details) {
                const product = productMap.get(item.productId);
                
                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para el producto: ${product.name}`);
                }

                // Cálculo del total
                const subtotal = Number(product.price) * item.quantity;
                totalAmount += subtotal;

                // Preparamos el detalle para la creación
                detailsWithPrices.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price, // Precio seguro de la BD
                });

                // Preparamos la actualización de stock (pero no la ejecutamos con 'await' aquí mismo)
                stockUpdatePromises.push(
                    tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    })
                );
            }

            // 4. Ejecutamos todas las actualizaciones de stock en paralelo
            await Promise.all(stockUpdatePromises);

            // 5. Creamos la venta final con el total calculado
            return await tx.sale.create({
                data: {
                    clientId: data.clientId,
                    status: data.status ?? "PENDING",
                    total: totalAmount, // Guardamos el total calculado
                    details: {
                        create: detailsWithPrices,
                    },
                },
                include: { details: true },
            });
        });
    } catch (error: any) {
        console.error("Error al crear venta:", error);
        throw new Error(error.message || "No se pudo crear la venta");
    }
};

/**
 * Actualiza una venta existente.
 * @param id - ID de la venta a actualizar.
 * @param data - Datos a actualizar.
 * @returns Venta actualizada o null si no existe.
 */
export const updateSale = async (id: number, data: UpdateSaleInput): Promise<SaleModel | null> => {
    try {
        return await prisma.$transaction(async (tx) => {
            let processedDetails = undefined;

            if (data.details && data.details.length > 0) {

                const productIds = data.details.map(d => d.productId);

                const products = await tx.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, price: true, stock: true } 
                });

                if (products.length !== productIds.length) {
                    throw new Error("Uno o más productos no existen");
                }

                const productMap = new Map(products.map(p => [p.id, p]));

                processedDetails = data.details.map(item => {
                    const product = productMap.get(item.productId)!; 

                    return {
                        where: { saleId_productId: { saleId: id, productId: item.productId } },
                        create: {
                            productId: item.productId,
                            quantity: item.quantity ?? 1,
                            unitaryPrice: product.price, 
                        },
                        update: {
                            quantity: item.quantity,
                            unitaryPrice: product.price, 
                        },
                    };
                });
            }

            await tx.sale.update({
                where: { id },
                data: {
                    clientId: data.clientId,
                    status: data.status,
                    details: processedDetails ? { upsert: processedDetails } : undefined,
                },
            });

            if (data.details) {
                const allDetails = await tx.saleDetails.findMany({
                    where: { saleId: id },
                    select: { quantity: true, unitaryPrice: true } 
                });

                const newTotal = allDetails.reduce((acc, detail) => {
                    return acc + (Number(detail.unitaryPrice) * detail.quantity);
                }, 0);

                return await tx.sale.update({
                    where: { id },
                    data: { total: newTotal },
                    include: { details: true },
                });
            }

            return await tx.sale.findUnique({
                where: { id },
                include: { details: true },
            });
        });
    } catch (error: any) {
        console.error(`Error al actualizar venta con id ${id}:`, error);
        throw new Error(error.message || "No se pudo actualizar la venta");
    }
};

/**
 * Elimina una venta de la base de datos.
 * @param id - ID de la venta a eliminar.
 * @returns Venta eliminada o null si no existe.
 */
export const disableSale = async (id: number): Promise<SaleModel | null> => {
    try {
        return await prisma.sale.update({
            where: { id },
            data: { status: "CANCELLED" },
            include: { details: true },
        });
    } catch (error) {
        console.warn(`Venta con id ${id} no encontrada o error al deshabilitar:`, error);
        throw new Error("No se pudo deshabilitar la venta");
    }
};
