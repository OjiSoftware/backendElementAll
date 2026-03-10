// src/controllers/subcategory.controller.ts
import { Request, Response } from "express";
import * as subCategoryService from "../services/subcategory.service";

/**
 * Obtener todas las subcategorías activas.
 */
export const getSubCategories = async (_req: Request, res: Response) => {
    try {
        const subCategories = await subCategoryService.getAllSubCategories();
        res.json(subCategories);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las subcategorías" });
    }
};

/**
 * Obtener subcategoría por ID.
 */
export const getSubCategory = async (req: Request, res: Response) => {
    try {
        const subCategory = await subCategoryService.getSubCategoryById(
            Number(req.params.id),
        );
        res.json(subCategory);
    } catch (error: any) {
        if (error.message === "Subcategoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al obtener la subcategoría" });
    }
};

/**
 * Crear nueva subcategoría.
 */
export const createSubCategory = async (req: Request, res: Response) => {
    try {
        const result = await subCategoryService.createSubCategory(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualizar subcategoría existente.
 */
export const updateSubCategory = async (req: Request, res: Response) => {
    try {
        const result = await subCategoryService.updateSubCategory(
            Number(req.params.id),
            req.body,
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Subcategoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({
            message: "Error al actualizar la subcategoría",
        });
    }
};

/**
 * Deshabilitar (soft delete) subcategoría.
 */
export const disableSubCategory = async (req: Request, res: Response) => {
    try {
        const result = await subCategoryService.disableSubCategory(
            Number(req.params.id),
        );
        res.json(result);
    } catch (error: any) {
        if (error.message === "Subcategoría no encontrada") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({
            message: "Error al deshabilitar la subcategoría",
        });
    }
};
