import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
import { CreateBrandInput, UpdateBrandInput } from "../types/brand.types";


export const findBrandById = async (id: number) => {
    return prisma.brand.findUnique({
        where: { id },
    });
};

export const getAllBrands = async () => {
    return prisma.brand.findMany({
        where: { status: true },
        orderBy: { id: "asc" },
    });
};

export const createBrand = async (data: CreateBrandInput) => {
    return prisma.brand.create({
        data,
    });
};

export const updateBrand = async (id: number, data: UpdateBrandInput) => {
    return prisma.brand.update({
        where: { id },
        data,
    });
};

export const disableBrand = async (id: number) => {
    return prisma.brand.update({
        where: { id },
        data: { status: false },
    });
};
