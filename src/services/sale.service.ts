// src/services/sale.service.ts
import * as saleRepo from "../repositories/sale.repository";
import { Sale as SaleModel } from "../generated/prisma/client";
import { CreateSaleInput, UpdateSaleInput } from "../types/sale.types";

/**
 * Obtiene todas las ventas de la base de datos
 * @returns Lista de ventas con sus detalles
 */
export const getAllSales = async (): Promise<SaleModel[]> => {
    return saleRepo.findAllSales();
};

/**
 * Obtiene una venta por ID
 * @param id - ID de la venta
 * @returns La venta encontrada con sus detalles
 * @throws Error si la venta no existe
 */
export const getSaleById = async (id: number): Promise<SaleModel> => {
    const sale = await saleRepo.findSaleById(id);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return sale;
};

/**
 * Crea una nueva venta
 * @param data - Datos de la venta y lista de productos (detalles)
 * @returns Mensaje de confirmación y la venta creada
 */
export const createSale = async (
    data: CreateSaleInput,
): Promise<{ message: string; sale: SaleModel }> => {
    const sale = await saleRepo.insertSale(data);
    return {
        message: "Venta creada con éxito",
        sale,
    };
};

/**
 * Actualiza una venta existente
 * @param id - ID de la venta a actualizar
 * @param data - Datos a modificar (cliente, estado o detalles)
 * @returns Mensaje de confirmación y la venta actualizada
 * @throws Error si la venta no existe
 */
export const updateSale = async (
    id: number,
    data: UpdateSaleInput,
): Promise<{ message: string; sale: SaleModel }> => {
    const sale = await saleRepo.updateSale(id, data);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return {
        message: "Venta actualizada con éxito",
        sale,
    };
};

/**
 * Elimina una venta de la base de datos
 * @param id - ID de la venta a eliminar
 * @returns Mensaje de confirmación y la venta eliminada
 * @throws Error si la venta no existe
 */
export const deleteSale = async (
    id: number,
): Promise<{ message: string; sale: SaleModel }> => {
    const sale = await saleRepo.deleteSale(id);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return {
        message: "Venta eliminada con éxito",
        sale,
    };
};