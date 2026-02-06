// src/repositories/subcategory.repository.ts
import { prisma } from "../prisma";
import { SubCategory as SubCategoryModel } from "../generated/prisma/client";
import { CreateSubCategoryInput, UpdateSubCategoryInput } from "../types/subcategory.types";

/**
 * Obtiene todas las subcategorías activas.
 * @returns Array de subcategorías.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllSubCategories = async (): Promise<SubCategoryModel[]> => {
    try {
        return await prisma.subCategory.findMany({
            where: { status: true },
            orderBy: { id: "asc" },
        });
    } catch (error) {
        console.error("Error al obtener subcategorías:", error);
        throw new Error("No se pudieron obtener las subcategorías");
    }
};

/**
 * Obtiene una subcategoría por su ID.
 * @param id - ID de la subcategoría a buscar.
 * @returns Subcategoría encontrada o null si no existe.
 * @throws Error si falla la consulta.
 */
export const findSubCategoryById = async (
    id: number,
): Promise<SubCategoryModel | null> => {
    try {
        return await prisma.subCategory.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error(`Error al buscar subcategoría ${id}:`, error);
        throw new Error("No se pudo buscar la subcategoría");
    }
};

/**
 * Crea una nueva subcategoría.
 * @param data - Datos para crear la subcategoría.
 * @returns Subcategoría creada.
 * @throws Error si falla la creación.
 */
export const insertSubCategory = async (
    data: CreateSubCategoryInput,
): Promise<SubCategoryModel> => {
    try {
        return await prisma.subCategory.create({
            data,
        });
    } catch (error) {
        console.error("Error al crear subcategoría:", error);
        throw new Error("No se pudo crear la subcategoría");
    }
};

/**
 * Actualiza una subcategoría existente.
 * @param id - ID de la subcategoría a actualizar.
 * @param data - Datos para actualizar.
 * @returns Subcategoría actualizada o null si no se encuentra.
 * @throws Error si falla la actualización.
 */
export const updateSubCategory = async (
    id: number,
    data: UpdateSubCategoryInput,
): Promise<SubCategoryModel | null> => {
    try {
        return await prisma.subCategory.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.warn(`Subcategoría ${id} no encontrada o error al actualizar`);
        return null;
    }
};

/**
 * Deshabilita una subcategoría (soft delete).
 * @param id - ID de la subcategoría a deshabilitar.
 * @returns Subcategoría deshabilitada o null si no se encuentra.
 * @throws Error si falla la operación.
 */
export const disableSubCategory = async (
    id: number,
): Promise<SubCategoryModel | null> => {
    try {
        return await prisma.subCategory.update({
            where: { id },
            data: { status: false },
        });
    } catch (error) {
        console.warn(
            `Subcategoría ${id} no encontrada o error al deshabilitar`,
        );
        return null;
    }
};
