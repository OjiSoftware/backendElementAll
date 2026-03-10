import { prisma } from "../prisma";
import {SaleDetails as SaleDetailsModel} from "../generated/prisma/client";
import {CreateSaleDetailsInput, UpdateSaleDetailsInput} from "../types/saleDetails.types";

/**
 * Obtiene todas los detalles de ventas de la base de datos.
 * @returns Array de detalles de ventas.
 * @throws Error si falla la consulta a la base de datos.
 */

export const findAllSaleDetails = async (): Promise<SaleDetailsModel[]> => {
  try {
    return await prisma.saleDetails.findMany();
  } catch (error) {
    console.error("Error al obtener detalles de ventas:", error);
    throw new Error("No se pudieron obtener los detalles de ventas");
  }
}

/**
 * Busca un detalle de venta por su ID.
 * @param id - ID del detalle de venta a buscar.
 * @returns Detalle de venta encontrado o null si no existe.
 * @throws Error si falla la consulta.
 */

export const findSaleDetailById = async (id: number): Promise<SaleDetailsModel | null> => {
  try {
    return await prisma.saleDetails.findUnique({ where: { id } });
  } catch (error) {
    console.error(`Error al buscar detalle de venta con id ${id}:`, error);
    throw new Error("No se pudo buscar el detalle de venta");
  }
}

/**
 * Crea un nuevo detalle de venta en la base de datos.
 * @param data - Objeto con los datos de la venta y sus detalles.
 * @returns Detalle de venta recién creado.
 * @throws Error si falla la inserción.
 */ 

export const insertSaleDetails = async (data: CreateSaleDetailsInput): Promise<SaleDetailsModel> => {
  try {
    return await prisma.saleDetails.create({ 
      data : {
        saleId: data.saleId,
        productId: data.productId,
        quantity: data.quantity,
        unitaryPrice: data.unitaryPrice
      }
    });
  } catch (error) {
    console.error("Error al crear detalle de venta:", error);
    throw new Error("No se pudo crear el detalle de venta");
  }
}

/**
 * Actualiza un detalle de venta existente.
 * @param id - ID del detalle de venta a actualizar.
 * @param data - Datos a actualizar.
 * @returns Detalle de venta actualizado o null si no existe.
 */

export const updateSaleDetails = async (id: number, data: UpdateSaleDetailsInput): Promise<SaleDetailsModel | null> => {
  try {
    return await prisma.saleDetails.update({ 
      where: { id }, 
      data:
        {
          saleId: data.saleId,
          productId: data.productId,
          quantity: data.quantity,
          unitaryPrice: data.unitaryPrice
        }
    });
  } catch (error) {
    console.warn(`Detalle de venta con id ${id} no encontrado o error al actualizar:`, error);
    throw new Error("No se pudo actualizar el detalle de venta");
  }
}

/**
 * Elimina un detalle de venta de la base de datos.
 * @param id - ID del detalle de venta a eliminar.
 * @returns Detalle de venta eliminado o null si no existe.
 */

export const deleteSaleDetails = async (id: number): Promise<SaleDetailsModel | null> => {
  try {
    return await prisma.saleDetails.delete({ where: { id } });
  } catch (error) {
    console.warn(`Detalle de venta con id ${id} no encontrado o error al eliminar:`, error);
    throw new Error("No se pudo eliminar el detalle de venta");
  }
}