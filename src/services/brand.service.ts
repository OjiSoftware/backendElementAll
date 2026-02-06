import * as repo from "../repository/brand.repository";
import {
    CreateBrandInput,
    UpdateBrandInput,
} from "../types/brand.types";

export const getBrand = async (id: number) => {
    const brand = await repo.findBrandById(id);

    if (!brand) throw new Error("Marca no encontrada");

    return brand;
};

export const listBrands = async () => {
    const brands = await repo.getAllBrands();

    if (brands.length === 0)
        throw new Error("No hay marcas guardadas");

    return brands;
};

export const createBrand = async (data: CreateBrandInput) => {
    return repo.createBrand(data);
};

export const updateBrand = async (id: number, data: UpdateBrandInput) => {
    const brand = await repo.updateBrand(id, data);

    if (!brand)
        throw new Error("Marca no encontrada para actualizar");

    return brand;
};

export const deleteBrand = async (id: number) => {
    const brand = await repo.disableBrand(id);

    if (!brand)
        throw new Error("Marca no encontrada para eliminar");

    return brand;
};
