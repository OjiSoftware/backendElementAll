// src/services/brand.service.ts
import * as brandRepo from "../repositories/brand.repository";
import { Brand as BrandModel } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

/**
 * Obtiene todas las marcas activas.
 * @returns Array de marcas activas.
 * @throws Error si no se pueden obtener las marcas.
 */
export const getAllBrands = async (): Promise<BrandModel[]> => {
    return brandRepo.findAllBrands();
};

/**
 * Obtiene una marca por su ID.
 * @param id - ID de la marca a buscar.
 * @returns La marca encontrada.
 * @throws Error si la marca no existe.
 */
export const getBrandById = async (id: number): Promise<BrandModel> => {
    const brand = await brandRepo.findBrandById(id);

    if (!brand) {
        throw new Error("Marca no encontrada");
    }

    return brand;
};

/**
 * Crea una nueva marca.
 * @param data - Datos de la marca a crear.
 * @returns Objeto con mensaje de confirmación y la marca creada.
 * @throws Error si falla la creación.
 */
export const createBrand = async (
    data: CreateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    return brandRepo.insertBrand(data);
};

/**
 * Modifica una marca existente.
 * @param id - ID de la marca a modificar.
 * @param data - Datos a actualizar.
 * @returns Objeto con mensaje de confirmación y la marca actualizada.
 * @throws Error si la marca no existe o falla la actualización.
 */
export const modifyBrand = async (
    id: number,
    data: UpdateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    const updated = await brandRepo.updateBrand(id, data);

    if (!updated) {
        throw new Error("Marca no encontrada");
    }

    return updated;
};

/**
 * Deshabilita (soft delete) una marca.
 * @param id - ID de la marca a deshabilitar.
 * @returns Objeto con mensaje de confirmación y la marca deshabilitada.
 * @throws Error si la marca no existe o falla la operación.
 */
export const removeBrand = async (
    id: number,
): Promise<{ message: string; brand: BrandModel }> => {
    const deleted = await brandRepo.disableBrand(id);

    if (!deleted) {
        throw new Error("Marca no encontrada");
    }

    return deleted;
};
