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
            include: { client: true, details: true },
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
            include: { 
                client: true,
                details: true },
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
            const detailsWithPrices = [];
            let totalInCents = 0;

            for (const item of data.details) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });
                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para el producto: ${product.name}`);
                }
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });

                const priceInCents = Math.round(Number(product.price) * 100);
                
                // Sumamos al total general
                totalInCents += (priceInCents * item.quantity);

                detailsWithPrices.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            } 

            const finalTotal = totalInCents / 100;

            return await tx.sale.create({
                data: {
                    clientId: data.clientId,
                    status: data.status ?? "PENDING",
                    total: finalTotal,
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
            // 1. Obtener la venta original
            const existingSale = await tx.sale.findUnique({
                where: { id },
                include: { details: true }
            });

            if (!existingSale) {
                throw new Error(`Venta con ID ${id} no encontrada`);
            }

            // Separamos los detalles del resto de la data (Spread Operator)
            const { details, ...restData } = data;

            // 2. Si no hay detalles nuevos, actualizamos solo la data básica (cliente, status, etc.)
            if (!details) {
                return await tx.sale.update({
                    where: { id },
                    data: { ...restData },
                    include: { details: true },
                });
            }

            // 3. Devolver el stock original a la base de datos
            for (const oldItem of existingSale.details) {
                await tx.product.update({
                    where: { id: oldItem.productId },
                    data: { stock: { increment: oldItem.quantity } }
                });
            }

            const newDetailsToCreate = [];
            let newTotal = 0;

            // 4. Validar nuevos detalles, descontar stock y calcular nuevo total
            for (const item of details) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId }
                });

                item.quantity = item.quantity ?? 0;

                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Stock insuficiente para el producto: ${product.name}`);
                }

                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                newTotal = newTotal + (Number(product.price) * item.quantity);

                newDetailsToCreate.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitaryPrice: product.price,
                });
            }

            // 5. Guardar los cambios finales (borrando detalles viejos y creando los nuevos)
            return await tx.sale.update({
                where: { id },
                data: {
                    ...restData, // Insertamos cliente, status, etc.
                    total: newTotal,
                    details: {
                        deleteMany: {}, 
                        create: newDetailsToCreate,
                    },
                },
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
