// src/repositories/brand.repository.ts
import { prisma } from "../prisma";
import { Brand as BrandModel } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

/**
 * Devuelve todas las marcas activas.
 * @returns Array de marcas activas.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllBrands = async (): Promise<BrandModel[]> => {
    try {
        return await prisma.brand.findMany({
            where: { status: true },
            orderBy: { id: "asc" },
        });
    } catch (error) {
        console.error("Error al obtener marcas:", error);
        throw new Error("No se pudieron obtener las marcas");
    }
};

/**
 * Busca una marca por su ID.
 * @param id - ID de la marca a buscar.
 * @returns Marca encontrada o null si no existe.
 * @throws Error si falla la consulta.
 */
export const findBrandById = async (id: number): Promise<BrandModel | null> => {
    try {
        return await prisma.brand.findUnique({ where: { id } });
    } catch (error) {
        console.error(`Error al buscar marca con id ${id}:`, error);
        throw new Error("No se pudo buscar la marca");
    }
};

/**
 * Crea una nueva marca.
 * @param data - Datos de la marca a crear.
 * @returns Objeto con mensaje de éxito y la marca creada.
 * @throws Error si falla la creación.
 */
export const insertBrand = async (
    data: CreateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.create({ data });
        return { message: "Marca creada con éxito", brand };
    } catch (error) {
        console.error("Error al crear marca:", error);
        throw new Error("No se pudo crear la marca");
    }
};

/**
 * Actualiza una marca existente.
 * @param id - ID de la marca a actualizar.
 * @param data - Datos a actualizar.
 * @returns Objeto con mensaje de éxito y la marca actualizada.
 * @throws Error si falla la actualización.
 */
export const updateBrand = async (
    id: number,
    data: UpdateBrandInput,
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.update({ where: { id }, data });
        return { message: "Marca actualizada con éxito", brand };
    } catch (error) {
        console.warn(`Marca con id ${id} no encontrada o error:`, error);
        throw new Error("No se pudo actualizar la marca");
    }
};

/**
 * Deshabilita (soft delete) una marca.
 * @param id - ID de la marca a deshabilitar.
 * @returns Objeto con mensaje de éxito y la marca deshabilitada.
 * @throws Error si falla la operación.
 */
export const disableBrand = async (
    id: number,
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.update({
            where: { id },
            data: { status: false },
        });
        return { message: "Marca deshabilitada con éxito", brand };
    } catch (error) {
        console.warn(`Marca con id ${id} no encontrada:`, error);
        throw new Error("No se pudo deshabilitar la marca");
    }
};
