// src/services/product.service.ts
import * as productRepo from "../repositories/product.repository";
import { Product as ProductModel } from "../generated/prisma/client";
import { CreateProductInput, UpdateProductInput } from "../types/product.types";

/**
 * Obtiene todos los productos activos.
 * @returns Lista de productos
 */
export const getAllProducts = async (): Promise<ProductModel[]> => {
    return await productRepo.findAllProducts();
};

/**
 * Obtiene un producto por su ID.
 * @param id - ID del producto
 * @returns Producto encontrado
 * @throws Error si no se encuentra
 */
export const getProductById = async (id: number): Promise<ProductModel> => {
    const product = await productRepo.findProductById(id);

    if (!product) {
        throw new Error("Producto no encontrado");
    }

    return product;
};

/**
 * Crea un nuevo producto.
 * @param data - Datos del producto
 * @returns Objeto con mensaje de confirmación y el producto creado
 */
export const createProduct = async (
    data: CreateProductInput,
): Promise<{ message: string; product: ProductModel }> => {
    const product = await productRepo.insertProduct(data);

    return {
        message: "Producto creado con éxito",
        product,
    };
};

/**
 * Actualiza un producto existente.
 * @param id - ID del producto
 * @param data - Datos a actualizar
 * @returns Objeto con mensaje de confirmación y el producto actualizado
 * @throws Error si no se encuentra el producto
 */
export const updateProduct = async (
    id: number,
    data: UpdateProductInput,
): Promise<{ message: string; product: ProductModel }> => {
    const updated = await productRepo.updateProduct(id, data);

    if (!updated) {
        throw new Error("Producto no encontrado");
    }

    return {
        message: "Producto actualizado con éxito",
        product: updated,
    };
};

/**
 * Elimina un producto.
 * @param id - ID del producto
 * @returns Objeto con mensaje de confirmación y el producto eliminado
 * @throws Error si no se encuentra el producto
 */
export const disableProduct = async (
    id: number,
): Promise<{ message: string; product: ProductModel }> => {
    const deleted = await productRepo.disableProduct(id);

    if (!deleted) {
        throw new Error("Producto no encontrado");
    }

    return {
        message: "Producto eliminado con éxito",
        product: deleted,
    };
};
