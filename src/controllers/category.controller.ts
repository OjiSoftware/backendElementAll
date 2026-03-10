// src/controllers/category.controller.ts
import { Request, Response } from "express";
import * as categoryService from "../services/category.service";

/**
 * Obtener todas las categorías activas
 */
export const getCategories = async (_req: Request, res: Response) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las categorías" });
    }
};

/**
 * Obtener categoría por ID
 */
export const getCategory = async (req: Request, res: Response) => {
    try {
        const category = await categoryService.getCategoryById(
            Number(req.params.id),
        );
        res.json(category);
    } catch (error: any) {
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al obtener la categoría" });
    }
};

/**
 * Crear nueva categoría
 */
export const createCategory = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.createCategory(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualizar categoría existente
 */
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.updateCategory(
            Number(req.params.id),
            req.body,
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar la categoría" });
    }
};

/**
 * Desactivar categoría (soft delete)
 */
export const disableCategory = async (req: Request, res: Response) => {
    try {
        const result = await categoryService.disableCategory(
            Number(req.params.id),
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Categoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al desactivar la categoría" });
    }
};


export const getCategoriesWithSub = async (_req: Request, res: Response) => {
    try {
        const result = await categoryService.getCategoriesWithSubcategories()

        res.json(result)
    } catch (error: any) {
        if (error.message === "Categoría no encontrada con getCategoriesWithSub") {
            return res.status(500).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al filtrar la categoría" });

    }
}