// src/repositories/product.repository.ts
import { prisma } from "../prisma";
import { Product as ProductModel } from "../generated/prisma/client";
import { CreateProductInput, UpdateProductInput } from "../types/product.types";

/**
 * Obtiene todos los productos activos.
 * @returns Lista de productos
 * @throws Error si falla la consulta
 */
export const findAllProducts = async (): Promise<ProductModel[]> => {
    try {
        return await prisma.product.findMany({
            where: { status: true },
            orderBy: { id: "asc" },
            include: {
                brand: true,
                subCategory: {
                    include: {
                        category: true 
                    }
                }
            },
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw new Error("No se pudieron obtener los productos");
    }
};

/**
 * Busca un producto por su ID.
 * @param id - ID del producto a buscar
 * @returns Producto encontrado o null si no existe
 * @throws Error si falla la consulta
 */
export const findProductById = async (
    id: number,
): Promise<ProductModel | null> => {
    try {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,   
                subCategory: { 
                    include: {
                        category: true,
                    }
                }
            },
        });
    } catch (error) {
        console.error(`Error al buscar producto con id ${id}:`, error);
        throw new Error("No se pudo buscar el producto");
    }
};

/**
 * Inserta un nuevo producto en la base de datos.
 * @param data - Datos del producto a crear
 * @returns Producto creado
 * @throws Error si falla la creación
 */
export const insertProduct = async (
    data: CreateProductInput,
): Promise<ProductModel> => {
    try {
        return await prisma.product.create({
            data,
        });
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw new Error("No se pudo crear el producto");
    }
};

/**
 * Actualiza un producto existente.
 * @param id - ID del producto a actualizar
 * @param data - Datos a actualizar
 * @returns Producto actualizado o null si no existe
 */
export const updateProduct = async (
    id: number,
    data: UpdateProductInput,
): Promise<ProductModel | null> => {
    try {
        return await prisma.product.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.warn(
            `Producto con id ${id} no encontrado o error al actualizar:`,
            error,
        );
        return null;
    }
};

/**
 * Elimina (o desactiva) un producto.
 * @param id - ID del producto a eliminar
 * @returns Producto eliminado o null si no existe
 */
export const disableProduct = async (
    id: number,
): Promise<ProductModel | null> => {
    try {
        return await prisma.product.update({
            where: { id },
            data: { status: false },
        });
    } catch (error) {
        console.warn(
            `Producto con id ${id} no encontrado o error al eliminar:`,
            error,
        );
        throw new Error("No se pudo eliminar el producto");
    }
};
