// src/controllers/product.controller.ts
import { Request, Response } from "express";
import * as productService from "../services/product.service";

/**
 * Obtiene todos los productos activos
 */
export const getProducts = async (_req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener los productos" });
    }
};

/**
 * Obtiene un producto por ID
 */
export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await productService.getProductById(
            Number(req.params.id),
        );
        res.json(product);
    } catch (error: any) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al obtener el producto" });
    }
};

/**
 * Crea un nuevo producto
 */
export const createProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza un producto existente
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.updateProduct(
            Number(req.params.id),
            req.body,
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
};

/**
 * Elimina un producto
 */
export const disableProduct = async (req: Request, res: Response) => {
    try {
        const result = await productService.disableProduct(
            Number(req.params.id),
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Producto no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
};
