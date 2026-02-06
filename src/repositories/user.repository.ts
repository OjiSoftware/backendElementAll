// src/repositories/user.repository.ts
import { prisma } from "../prisma";
import { User } from "../generated/prisma/client";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";

/**
 * Obtiene todos los usuarios.
 * Retorna un array de usuarios ordenados por ID.
 */
export const findAllUsers = async (): Promise<User[]> => {
    try {
        return await prisma.user.findMany({
            orderBy: { id: "asc" },
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw new Error("No se pudieron obtener los usuarios");
    }
};

/**
 * Obtiene un usuario por su ID.
 * @param id - ID del usuario a buscar
 * @returns Usuario encontrado o null si no existe
 */
export const findUserById = async (id: number): Promise<User | null> => {
    try {
        return await prisma.user.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error(`Error al buscar usuario ${id}:`, error);
        throw new Error("No se pudo buscar el usuario");
    }
};

/**
 * Crea un nuevo usuario.
 * @param data - Datos para crear el usuario
 * @returns Usuario creado
 */
export const createUser = async (data: CreateUserInput): Promise<User> => {
    try {
        return await prisma.user.create({
            data,
        });
    } catch (error) {
        console.error("Error al crear usuario:", error);
        throw new Error("No se pudo crear el usuario");
    }
};

/**
 * Actualiza un usuario existente.
 * @param id - ID del usuario a actualizar
 * @param data - Datos para actualizar
 * @returns Usuario actualizado o null si no se encuentra
 */
export const updateUser = async (
    id: number,
    data: UpdateUserInput,
): Promise<User | null> => {
    try {
        return await prisma.user.update({
            where: { id },
            data,
        });
    } catch (error) {
        console.warn(`Usuario ${id} no encontrado o error al actualizar`);
        return null;
    }
};

/**
 * Elimina un usuario.
 * @param id - ID del usuario a eliminar
 * @returns Usuario eliminado o null si no se encuentra
 */
export const deleteUser = async (id: number): Promise<User | null> => {
    try {
        return await prisma.user.delete({
            where: { id },
        });
    } catch (error) {
        console.warn(`Usuario ${id} no encontrado o error al eliminar`);
        return null;
    }
};
