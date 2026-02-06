import * as repo from "../repository/user.repository";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";


export const getUser = async (id: number) => {
    const user = await repo.findUserById(id);

    if (!user) throw new Error("Usuario no encontrado");

    return user;
}


export const listUsers = async () => {
    const userList = await repo.getAllUsers();

    if (userList.length === 0) throw new Error("No hay usuarios que mostrar");

    return userList;
}

export const createUser = async (data: CreateUserInput) => {
    return repo.createUser(data);
}

export const updateUser = async (id: number, data: UpdateUserInput) => {
    const user = await repo.updateUser(id, data);

    if (!user) throw new Error('No se encontro el usuario para actualizar');

    return user;
}

export const deleteUser = async (id: number) => {
    const user = await repo.deleteUser(id);

    if (!user) throw new Error('No se encontró el usuario a eliminar');

    return user;
}