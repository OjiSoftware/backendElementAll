import * as saleDetailsRepo from "../repositories/saleDetails.repository";
import { SaleDetails as SaleDetailsModel } from "../generated/prisma/client";
import { CreateSaleDetailsInput , UpdateSaleDetailsInput} from "../types/saleDetails.types";

/**
 * Obtiene todas los detalles de venta de la base de datos.
 * @returns Array de detalles de venta.
 */
export const getAllSaleDetails = async (): Promise<SaleDetailsModel[]> => {
  return saleDetailsRepo.findAllSaleDetails();
};

/**
 * Obtiene un detalle de venta por ID.
 * @param id - ID del detalle de venta a buscar.
 * @returns Detalle de venta encontrado o null si no existe.
 */
export const getSaleDetailsById = async (id: number): Promise<SaleDetailsModel> => {
  const saleDetail = await saleDetailsRepo.findSaleDetailById(id);

  if (!saleDetail) {
    throw new Error("Detalle de venta no encontrado");
  }

  return saleDetail;
};

/**
 * Crea un nuevo detalle de venta en la base de datos.
 * @param data - Objeto con los datos de la venta y sus detalles.
 * @returns Detalle de venta recién creado.
 */
export const createSaleDetail = async (
  data: CreateSaleDetailsInput,
  ) : Promise<{ message: string; saleDetail: SaleDetailsModel }> => {
    const saleDetail = await saleDetailsRepo.insertSaleDetails(data);

    return {
      message: "Detalle de venta creado con éxito",
      saleDetail,
    };
};

/**
 * Actualiza un detalle de venta existente.
 * @param id - ID del detalle de venta a actualizar.    
 * @param data - Datos a actualizar.
 * @returns Detalle de venta actualizado o null si no existe.
 * @throws Error si falla la actualización.
 */
export const updateSaleDetails = async (
  id: number,
  data: UpdateSaleDetailsInput,
): Promise<{ message: string; saleDetail: SaleDetailsModel }> => {
  const saleDetail = await saleDetailsRepo.updateSaleDetails(id, data);

  if (!saleDetail) {
    throw new Error("Detalle de venta no encontrado");
  }

  return {
    message: "Detalle de venta actualizado con éxito",
    saleDetail,
  };
};

/**
 * Elimina un detalle de venta de la base de datos.
 * @param id - ID del detalle de venta a eliminar.
 * @returns Detalle de venta eliminado o null si no existe.
 * @throws Error si falla la eliminación.
 */
export const deleteSaleDetails = async (
  id: number,
): Promise<{ message: string; saleDetail: SaleDetailsModel }> => {
  const saleDetail = await saleDetailsRepo.deleteSaleDetails(id);

  if (!saleDetail) {
    throw new Error("Detalle de venta no encontrado");
  }

  return {
    message: "Detalle de venta eliminado con éxito",
    saleDetail,
  };
};