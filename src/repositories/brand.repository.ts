// src/repositories/brand.repository.ts
import { prisma } from "../prisma";
import { Brand as BrandModel, Prisma } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

type BrandWithSubCategory = Prisma.BrandGetPayload<{
    include: { subCategory: true };
}>;

/**
 * Obtiene todas las marcas activas.
 */
export const findAllBrands = async (): Promise<BrandWithSubCategory[]> => {
    try {
        return await prisma.brand.findMany({
            where: { status: true },
            orderBy: { id: "asc" },
            include: { subCategory: true },
        });
    } catch (error) {
        console.error("Error al obtener marcas:", error);
        throw new Error("No se pudieron obtener las marcas");
    }
};

/**
 * Busca una marca por su ID.
 */
export const findBrandById = async (
    id: number,
): Promise<BrandWithSubCategory | null> => {
    try {
        return await prisma.brand.findUnique({
            where: { id },
            include: { subCategory: true },
        });
    } catch (error) {
        console.error(`Error al buscar marca con id ${id}:`, error);
        throw new Error("No se pudo buscar la marca");
    }
};

/**
 * Inserta (crea) una nueva marca.
 */
export const insertBrand = async (
    data: CreateBrandInput,
): Promise<BrandModel> => {
    try {
        return await prisma.brand.create({
            data: {
                name: data.name,
                subCategory: { connect: { id: data.subCategoryId } },
            },
        });
    } catch (error) {
        console.error("Error al crear marca:", error);
        throw new Error("No se pudo crear la marca");
    }
};

/**
 * Actualiza los datos de una marca existente.
 */
export const updateBrand = async (
    id: number,
    data: UpdateBrandInput,
): Promise<BrandModel | null> => {
    try {
        return await prisma.brand.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.warn(`Marca con id ${id} no encontrada o error:`, error);
        return null;
    }
};

/**
 * Deshabilita una marca (soft delete).
 */
export const disableBrand = async (id: number): Promise<BrandModel | null> => {
    try {
        return await prisma.brand.update({
            where: { id },
            data: { status: false },
        });
    } catch (error) {
        console.warn(`Error al deshabilitar marca con id ${id}:`, error);
        return null;
    }
};
