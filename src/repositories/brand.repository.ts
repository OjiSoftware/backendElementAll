import { prisma } from "../prisma";
import { Brand as BrandModel, Prisma } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

type BrandWithSubCategory = Prisma.BrandGetPayload<{
    include: { subCategory: true };
}>;

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


export const findBrandById = async (id: number): Promise<BrandWithSubCategory | null> => {
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


export const insertBrand = async (
    data: CreateBrandInput
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.create({ data });
        return { message: "Marca creada con éxito", brand };
    } catch (error) {
        console.error("Error al crear marca:", error);
        throw new Error("No se pudo crear la marca");
    }
};


export const updateBrand = async (
    id: number,
    data: UpdateBrandInput
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.update({ where: { id }, data });
        return { message: "Marca actualizada con éxito", brand };
    } catch (error) {
        console.warn(`Marca con id ${id} no encontrada o error:`, error);
        throw new Error("No se pudo actualizar la marca");
    }
};

export const disableBrand = async (
    id: number
): Promise<{ message: string; brand: BrandModel }> => {
    try {
        const brand = await prisma.brand.update({
            where: { id },
            data: { status: false },
        });
        return { message: "Marca deshabilitada con éxito", brand };
    } catch (error) {
        console.warn(`Marca con id ${id} no encontrada:`, error);
        throw new Error("No se pudo deshabilitar la marca");
    }
};
