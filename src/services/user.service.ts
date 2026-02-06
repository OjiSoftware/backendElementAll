// src/services/user.service.ts
import * as repo from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";
import { User } from "../generated/prisma/client";

/**
 * Obtiene un usuario por ID.
 * @param id - ID del usuario
 * @returns Usuario encontrado
 * @throws Error si no se encuentra
 */
export const getUserById = async (id: number): Promise<User> => {
    const user = await repo.findUserById(id);

    if (!user) throw new Error("Usuario no encontrado");

    return user;
};

/**
 * Lista todos los usuarios.
 * @returns Array de usuarios
 * @throws Error si no hay usuarios
 */
export const listUsers = async (): Promise<User[]> => {
    const userList = await repo.findAllUsers();

    if (userList.length === 0) throw new Error("No hay usuarios que mostrar");

    return userList;
};

/**
 * Crea un nuevo usuario.
 * @param data - Datos del usuario
 * @returns Objeto con mensaje y usuario creado
 */
export const createUser = async (
    data: CreateUserInput,
): Promise<{ message: string; user: User }> => {
    const user = await repo.createUser(data);
    return {
        message: "Usuario creado con éxito",
        user,
    };
};

/**
 * Actualiza un usuario existente.
 * @param id - ID del usuario
 * @param data - Datos a actualizar
 * @returns Objeto con mensaje y usuario actualizado
 * @throws Error si el usuario no existe
 */
export const updateUser = async (
    id: number,
    data: UpdateUserInput,
): Promise<{ message: string; user: User }> => {
    const user = await repo.updateUser(id, data);

    if (!user) throw new Error("No se encontró el usuario para actualizar");

    return {
        message: "Usuario actualizado con éxito",
        user,
    };
};

/**
 * Elimina un usuario.
 * @param id - ID del usuario
 * @returns Objeto con mensaje y usuario eliminado
 * @throws Error si el usuario no existe
 */
export const deleteUser = async (
    id: number,
): Promise<{ message: string; user: User }> => {
    const user = await repo.deleteUser(id);

    if (!user) throw new Error("No se encontró el usuario a eliminar");

    return {
        message: "Usuario eliminado con éxito",
        user,
    };
};
