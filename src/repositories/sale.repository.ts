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
        return await prisma.sale.create({
            data: {
                clientId: data.clientId,
                status: data.status ?? "PENDING",
                details: {
                    create: data.details.map(d => ({
                        productId: d.productId,
                        quantity: d.quantity,
                        unitaryPrice: d.unitaryPrice,
                    })),
                },
            },
            include: { details: true },
        });
    } catch (error) {
        console.error("Error al crear venta:", error);
        throw new Error("No se pudo crear la venta");
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
        return await prisma.sale.update({
            where: { id },
            data: {
                clientId: data.clientId,
                status: data.status,
                details: data.details
                    ? {
                          upsert: data.details.map(d => ({
                              where: { saleId_productId: { saleId: id, productId: d.productId } },
                              create: {
                                  productId: d.productId,
                                  quantity: d.quantity ?? 1,
                                  unitaryPrice: d.unitaryPrice ?? 0,
                              },
                              update: {
                                  quantity: d.quantity,
                                  unitaryPrice: d.unitaryPrice,
                              },
                          })),
                      }
                    : undefined,
            },
            include: { details: true },
        });
    } catch (error) {
        console.warn(`Venta con id ${id} no encontrada o error al actualizar:`, error);
        return null;
    }
};

/**
 * Elimina una venta de la base de datos.
 * @param id - ID de la venta a eliminar.
 * @returns Venta eliminada o null si no existe.
 */
export const deleteSale = async (id: number): Promise<SaleModel | null> => {
    try {
        return await prisma.sale.delete({
            where: { id },
            include: { details: true },
        });
    } catch (error) {
        console.warn(`Venta con id ${id} no encontrada o error al eliminar:`, error);
        return null;
    }
};
