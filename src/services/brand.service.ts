import * as brandRepo from "../repositories/brand.repository";
import { Brand as BrandModel } from "../generated/prisma/client";
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";

export const getAllBrands = async (): Promise<BrandModel[]> => {
    return brandRepo.findAllBrands();
};

export const getBrandById = async (id: number): Promise<BrandModel> => {
    const brand = await brandRepo.findBrandById(id);
    if (!brand) throw new Error("Marca no encontrada");
    return brand;
};

export const createBrand = async (data: CreateBrandInput) => {
    return brandRepo.insertBrand(data);
};

export const modifyBrand = async (id: number, data: UpdateBrandInput) => {
    return brandRepo.updateBrand(id, data);
};

export const removeBrand = async (id: number) => {
    return brandRepo.disableBrand(id);
};
