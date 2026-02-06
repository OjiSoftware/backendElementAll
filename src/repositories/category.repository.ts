import { prisma } from "../prisma";
import { Category as CategoryModel } from "../generated/prisma/client";
import { CreateCategoryInput, UpdateCategoryInput } from "../types/category.types";

/**
 * Obtiene todas las categorías activas ordenadas por ID ascendente.
 * @returns Lista de categorías
 * @throws Error si falla la consulta a la BD
 */
export const findAllCategories = async (): Promise<CategoryModel[]> => {
    try {
        return await prisma.category.findMany({
            where: { status: true },
            orderBy: { id: "asc" },
        });
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        throw new Error("No se pudieron obtener las categorías");
    }
};

/**
 * Busca una categoría por su ID
 * @param id - ID de la categoría
 * @returns La categoría encontrada o null si no existe
 * @throws Error si falla la consulta a la BD
 */
export const findCategoryById = async (
    id: number,
): Promise<CategoryModel | null> => {
    try {
        return await prisma.category.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error(`Error al buscar categoría con id ${id}:`, error);
        throw new Error("No se pudo buscar la categoría");
    }
};

/**
 * Crea una nueva categoría
 * @param data - Datos de la categoría a crear
 * @returns La categoría creada
 * @throws Error si falla la inserción en la BD
 */
export const insertCategory = async (
    data: CreateCategoryInput,
): Promise<CategoryModel> => {
    try {
        return await prisma.category.create({
            data,
        });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        throw new Error("No se pudo crear la categoría");
    }
};

/**
 * Actualiza una categoría existente
 * @param id - ID de la categoría a actualizar
 * @param data - Datos a modificar
 * @returns La categoría actualizada o null si no existe
 */
export const updateCategory = async (
    id: number,
    data: UpdateCategoryInput,
): Promise<CategoryModel | null> => {
    try {
        return await prisma.category.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.warn(
            `Categoría con id ${id} no encontrada o error al actualizar`,
            error,
        );
        return null;
    }
};

/**
 * Desactiva una categoría (status = false)
 * @param id - ID de la categoría a desactivar
 * @returns La categoría desactivada o null si no existe
 */
export const disableCategory = async (
    id: number,
): Promise<CategoryModel | null> => {
    try {
        return await prisma.category.update({
            where: { id },
            data: { status: false },
        });
    } catch (error) {
        console.warn(
            `Categoría con id ${id} no encontrada o error al desactivar`,
            error,
        );
        return null;
    }
};
