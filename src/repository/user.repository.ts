import { PrismaClient } from "../generated/prisma";
export const prisma = new PrismaClient();

import { CreateUserInput, UpdateUserInput } from "../types/user.types";


export const findUserById = async (id: number) => {
    return prisma.user.findUnique({ where: { id } });

}

export const createUser = async (data: CreateUserInput) => {
    return prisma.user.create({
        data
    })
}

export const deleteUser = async (id: number) => {
    return prisma.user.delete({
        where: { id }
    })
}

export const getAllUsers = async () => {
    return prisma.user.findMany()
}

export const updateUser = async (id: number, data: UpdateUserInput) => {
    return prisma.user.update({
        where: { id },
        data,
    });
};