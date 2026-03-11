// src/services/sale.service.ts
import * as saleRepo from "../repositories/sale.repository";
import { Sale as SaleModel } from "../generated/prisma/client";
import {
    CreateSaleInput,
    UpdateSaleInput,
    SaleWithAll,
} from "../types/sale.types";

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
): Promise<{ message: string; sale: SaleWithAll }> => {
    const sale = await saleRepo.insertSale(data);
    return {
        message: "Venta creada con éxito",
        sale: sale as SaleWithAll,
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
): Promise<{ message: string; sale: SaleWithAll }> => {
    const sale = await saleRepo.updateSale(id, data);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return {
        message: "Venta actualizada con éxito",
        sale: sale as SaleWithAll,
    };
};

/**
 * Elimina una venta de la base de datos
 * @param id - ID de la venta a eliminar
 * @returns Mensaje de confirmación y la venta eliminada
 * @throws Error si la venta no existe
 */
export const disableSale = async (
    id: number,
): Promise<{ message: string; sale: SaleWithAll }> => {
    const sale = await saleRepo.disableSale(id);

    if (!sale) {
        throw new Error("Venta no encontrada");
    }

    return {
        message: "Venta eliminada con éxito",
        sale: sale as SaleWithAll,
    };
};

/**
 * Crea una venta desde el carrito público (Guest Checkout)
 * @param clientData - Datos del formulario del cliente
 * @param items - Productos del carrito
 * @param total - Monto total
 * @returns La venta creada con su ID para Mercado Pago
 */
export const createGuestSale = async (
    clientData: any,
    items: any[],
    total: number,
): Promise<{ message: string; sale: SaleWithAll }> => {
    // Validaciones extra de negocio podrían ir acá antes de tocar la DB
    if (!clientData.dni || items.length === 0) {
        throw new Error("Faltan datos obligatorios para crear la orden");
    }

    // Delegamos la operación de base de datos al Repositorio
    const sale = await saleRepo.insertGuestSale(clientData, items, total);

    return {
        message: "Orden de invitado creada con éxito",
        sale: sale as SaleWithAll,
    };
};
