// src/services/brand.service.ts
import * as brandRepo from "../repositories/brand.repository";
import { Brand as BrandModel } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

/**
 * Obtiene todas las marcas activas.
 */
export const getAllBrands = async (): Promise<BrandModel[]> => {
    return await brandRepo.findAllBrands();
};

/**
 * Obtiene una marca por su ID.
 * @param id - ID de la marca
 * @returns Marca encontrada
 * @throws Error si no se encuentra
 */
export const getBrandById = async (id: number): Promise<BrandModel> => {
    const brand = await brandRepo.findBrandById(id);

    if (!brand) throw new Error("Marca no encontrada");

    return brand;
};

/**
 * Crea una nueva marca.
 * @param data - Datos de la marca
 * @returns Objeto con mensaje y la marca creada
 */
export const createBrand = async (
    data: CreateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    const brand = await brandRepo.insertBrand(data); // brand: BrandModel

    return {
        message: "Marca creada con éxito",
        brand,
    };
};

/**
 * Actualiza una marca existente.
 * @param id - ID de la marca
 * @param data - Datos a actualizar
 * @returns Objeto con mensaje y la marca actualizada
 * @throws Error si no se encuentra la marca
 */
export const modifyBrand = async (
    id: number,
    data: UpdateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    const updated = await brandRepo.updateBrand(id, data);

    if (!updated) throw new Error("Marca no encontrada");

    return {
        message: "Marca actualizada con éxito",
        brand: updated,
    };
};

/**
 * Deshabilita (soft delete) una marca.
 * @param id - ID de la marca
 * @returns Objeto con mensaje y la marca deshabilitada
 * @throws Error si no se encuentra la marca
 */
export const disableBrand = async (
    id: number,
): Promise<{ message: string; brand: BrandModel }> => {
    const disabled = await brandRepo.disableBrand(id);

    if (!disabled) throw new Error("Marca no encontrada");

    return {
        message: "Marca deshabilitada con éxito",
        brand: disabled,
    };
};
