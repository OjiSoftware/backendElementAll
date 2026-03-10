import * as billAddressRepo from "../repositories/billAddress.repository";
import { BillAddress as BillAddressModel } from "../generated/prisma/client";
import { CreateBillAddressInput, UpdateBillAddressInput } from "../types/billAddress.types";

/**
 * Obtiene todas las dirrecciones.
 * @returns Array de direcciones.
 * @throws Error si falla la consulta a la base de datos.
 */
export const getAllBillAddresses = async (): Promise<BillAddressModel[]> => {
    return billAddressRepo.findAllBillAddresses();
};

/**
 * Obtiene una direccion por ID.
 * @param id - ID de la direccion a buscar.
 * @returns Direccion encontrada o null si no existe.
 * @throws Error si falla la consulta a la base de datos.
 */
export const getBillAddressById = async (id: number): Promise<BillAddressModel | null> => {
    const billAddress = await billAddressRepo.findBillAddressById(id);

    if (!billAddress) {
        throw new Error("No se pudo obtener la direccion");
    }

    return billAddress;
};

/**
 * Crea una nueva direccion.
 * @param data - Datos de la direccion a crear.
 * @returns Objeto con mensaje de exito y la direccion creada.
 * @throws Error si falla la creacion.
 */
export const createBillAddress = async (
    data: CreateBillAddressInput,
) : Promise<{ message: string; billAddress: BillAddressModel }> => {
    return await billAddressRepo.insertBillAddress(data);
};

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
    return await billAddressRepo.updateBillAddress(id, data);

};

/**
 * Elimina una direccion.
 * @param id - ID de la direccion a eliminar.
 * @returns Objeto con mensaje de exito y la direccion eliminada.
 * @throws Error si falla la eliminacion.
 */
export const deleteBillAddress = async (id: number): Promise<{ message: string; billAddress: BillAddressModel }> => {
    return await billAddressRepo.deleteBillAddress(id);
};
