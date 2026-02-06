import * as categoryRepo from "../repositories/category.repository";
import { Category as CategoryModel } from "../generated/prisma/client";
import {
    CreateCategoryInput,
    UpdateCategoryInput,
} from "../types/category.types";

/**
 * Obtiene todas las categorías activas
 * @returns Lista de categorías
 */
export const getAllCategories = async (): Promise<CategoryModel[]> => {
    return categoryRepo.findAllCategories();
};

/**
 * Obtiene una categoría por ID
 * @param id - ID de la categoría
 * @returns La categoría encontrada
 * @throws Error si la categoría no existe
 */
export const getCategoryById = async (id: number): Promise<CategoryModel> => {
    const category = await categoryRepo.findCategoryById(id);

    if (!category) {
        throw new Error("Categoría no encontrada");
    }

    return category;
};

/**
 * Crea una nueva categoría
 * @param data - Datos de la categoría
 * @returns Mensaje de confirmación y la categoría creada
 */
export const createCategory = async (
    data: CreateCategoryInput,
): Promise<{ message: string; category: CategoryModel }> => {
    const category = await categoryRepo.insertCategory(data);
    return {
        message: "Categoría creada con éxito",
        category,
    };
};

/**
 * Actualiza una categoría existente
 * @param id - ID de la categoría a actualizar
 * @param data - Datos a modificar
 * @returns Mensaje de confirmación y la categoría actualizada
 * @throws Error si la categoría no existe
 */
export const updateCategory = async (
    id: number,
    data: UpdateCategoryInput,
): Promise<{ message: string; category: CategoryModel }> => {
    const category = await categoryRepo.updateCategory(id, data);

    if (!category) {
        throw new Error("Categoría no encontrada");
    }

    return {
        message: "Categoría actualizada con éxito",
        category,
    };
};

/**
 * Desactiva una categoría (status = false)
 * @param id - ID de la categoría a desactivar
 * @returns Mensaje de confirmación y la categoría desactivada
 * @throws Error si la categoría no existe
 */
export const disableCategory = async (
    id: number,
): Promise<{ message: string; category: CategoryModel }> => {
    const category = await categoryRepo.disableCategory(id);

    if (!category) {
        throw new Error("Categoría no encontrada");
    }

    return {
        message: "Categoría desactivada con éxito",
        category,
    };
};
