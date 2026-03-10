// src/controllers/brand.controller.ts
import { Request, Response } from "express";
import * as brandService from "../services/brand.service";

/**
 * Obtiene todas las marcas activas.
 */
export const getBrands = async (_req: Request, res: Response) => {
    try {
        const brands = await brandService.getAllBrands();
        res.json(brands);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las marcas" });
    }
};

/**
 * Obtiene una marca por su ID.
 */
export const getBrand = async (req: Request, res: Response) => {
    try {
        const brand = await brandService.getBrandById(Number(req.params.id));
        res.json(brand);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

/**
 * Crea una nueva marca.
 */
export const createBrand = async (req: Request, res: Response) => {
    try {
        const result = await brandService.createBrand(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza una marca existente.
 */
export const updateBrand = async (req: Request, res: Response) => {
    try {
        const result = await brandService.modifyBrand(
            Number(req.params.id),
            req.body,
        );
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

/**
 * Deshabilita (soft delete) una marca.
 */
export const disableBrand = async (req: Request, res: Response) => {
    try {
        const result = await brandService.disableBrand(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(error.message === "Marca no encontrada" ? 404 : 500).json({
            message: error.message,
        });
    }
};

