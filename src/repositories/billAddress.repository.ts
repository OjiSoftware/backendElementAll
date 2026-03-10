import {prisma} from "../prisma";
import {BillAddress as BillAddressModel} from "../generated/prisma/client";
import {CreateBillAddressInput, UpdateBillAddressInput} from "../types/billAddress.types";

/**
 * Devuelve todas las direcciones.
 * @returns Array de direcciones.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllBillAddresses = async (): Promise<BillAddressModel[]> => {
  try {
    return await prisma.billAddress.findMany();
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    throw new Error("No se pudieron obtener las direcciones");
  }
}

/**
 * Devuelve una direccion por ID.
 * @param id - ID de la direccion a buscar.
 * @returns Direccion encontrada o null si no existe.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findBillAddressById = async (id: number): Promise<BillAddressModel | null> => {
  try {
    return await prisma.billAddress.findUnique({ where: { id } });
  } catch (error) {
    console.error(`Error al buscar direccion con id ${id}:`, error);
    throw new Error("No se pudo buscar la direccion");
  }
}

/**
 * Crea una nueva direccion.
 * @param data - Datos de la direccion a crear.
 * @returns Objeto con mensaje de exito y la direccion creada.
 * @throws Error si falla la creacion.
 */
export const insertBillAddress = async (
  data: CreateBillAddressInput,
) : Promise<{ message: string; billAddress: BillAddressModel }> => {
  try {
    const billAddress = await prisma.billAddress.create({ data });
    return { message: "Direccion creada con exito", billAddress };
  } catch (error) {
    console.error("Error al crear direccion:", error);
    throw new Error("No se pudo crear la direccion");
  }
}

/**
 * Modifica una direccion.
 * @param id - ID de la direccion a modificar.
 * @param data - Datos a actualizar.
 * @returns Objeto con mensaje de exito y la direccion modificada.
 * @throws Error si falla la modificacion.
 */
export const updateBillAddress = async (
  id: number,
  data: UpdateBillAddressInput,
) : Promise<{ message: string; billAddress: BillAddressModel }> => {
  try {
    const billAddress = await prisma.billAddress.update({ 
      where: { id }, 
      data });
    return { message: "Direccion actualizada con exito", billAddress };
  } catch (error) {
    console.error(`Error al actualizar direccion con id ${id}:`, error);
    throw new Error("No se pudo actualizar la direccion");
  }
}

/**
 * Elimina una direccion.
 * @param id - ID de la direccion a eliminar.
 * @returns Objeto con mensaje de exito y la direccion eliminada.
 * @throws Error si falla la eliminacion.
 */
export const deleteBillAddress = async (
  id: number
): Promise<{ message: string; billAddress: BillAddressModel }> => {
  try {
    const billAddress = await prisma.billAddress.delete
    ({ where: { id } });
    return { message: "Direccion eliminada con exito", billAddress };
  } catch (error) {
    console.error(`Error al eliminar direccion con id ${id}:`, error);
    throw new Error("No se pudo eliminar la direccion");
  }
}