// src/services/subcategory.service.ts
import * as subCategoryRepo from "../repositories/subcategory.repository";
import { SubCategory as SubCategoryModel } from "../generated/prisma/client";
import {
    CreateSubCategoryInput,
    UpdateSubCategoryInput,
} from "../types/subcategory.types";

/**
 * Obtiene todas las subcategorías activas.
 * @returns Array de subcategorías.
 * @throws Error si falla la consulta.
 */
export const getAllSubCategories = async (): Promise<SubCategoryModel[]> => {
    return subCategoryRepo.findAllSubCategories();
};

/**
 * Obtiene una subcategoría por su ID.
 * @param id - ID de la subcategoría.
 * @returns Subcategoría encontrada.
 * @throws Error si no se encuentra la subcategoría.
 */
export const getSubCategoryById = async (
    id: number,
): Promise<SubCategoryModel> => {
    const subCategory = await subCategoryRepo.findSubCategoryById(id);

    if (!subCategory) throw new Error("Subcategoría no encontrada");

    return subCategory;
};

/**
 * Crea una nueva subcategoría.
 * @param data - Datos para crear la subcategoría.
 * @returns Objeto con mensaje de éxito y la subcategoría creada.
 * @throws Error si falla la creación.
 */
export const createSubCategory = async (
    data: CreateSubCategoryInput,
): Promise<{ message: string; subCategory: SubCategoryModel }> => {
    const subCategory = await subCategoryRepo.insertSubCategory(data);
    return {
        message: "Subcategoría creada con éxito",
        subCategory,
    };
};

/**
 * Actualiza una subcategoría existente.
 * @param id - ID de la subcategoría a actualizar.
 * @param data - Datos a actualizar.
 * @returns Objeto con mensaje de éxito y la subcategoría actualizada.
 * @throws Error si no se encuentra la subcategoría.
 */
export const updateSubCategory = async (
    id: number,
    data: UpdateSubCategoryInput,
): Promise<{ message: string; subCategory: SubCategoryModel }> => {
    const subCategory = await subCategoryRepo.updateSubCategory(id, data);

    if (!subCategory) throw new Error("Subcategoría no encontrada");

    return {
        message: "Subcategoría actualizada con éxito",
        subCategory,
    };
};

/**
 * Deshabilita (soft delete) una subcategoría.
 * @param id - ID de la subcategoría a deshabilitar.
 * @returns Objeto con mensaje de éxito y la subcategoría deshabilitada.
 * @throws Error si no se encuentra la subcategoría.
 */
export const disableSubCategory = async (
    id: number,
): Promise<{ message: string; subCategory: SubCategoryModel }> => {
    const subCategory = await subCategoryRepo.disableSubCategory(id);

    if (!subCategory) throw new Error("Subcategoría no encontrada");

    return {
        message: "Subcategoría deshabilitada con éxito",
        subCategory,
    };
};
