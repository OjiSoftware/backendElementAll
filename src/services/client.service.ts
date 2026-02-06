/* import * as repo from "../repository/client.repository";

export const getClient = (id: number) => {
    const client = repo.findClientById(id);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};

export const createClient = (data: repo.CreateClientInput) => {
    return repo.insertClient(data);
};

export const updateClient = (id: number, data: repo.UpdateClientInput) => {
    const client = repo.updateClient(id, data);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};
 */


// src/services/client.service.ts
import * as repo from "../repository/client.repository";
import { PrismaClient } from "../generated/prisma"; // importar la clase

const prisma = new PrismaClient();

export const getAllClients = async () => {
    return prisma.client.findMany();
};


export const getClient = async (id: number) => {
    const client = await repo.findClientById(id);
    if (!client) throw new Error("Cliente no encontrado");
    return client;
};

export const createClient = async (data: repo.CreateClientInput) => {
    return repo.insertClient(data);
};

export const updateClient = async (
    id: number,
    data: repo.UpdateClientInput
) => {
    const client = await repo.updateClient(id, data);
    if (!client) throw new Error("Cliente no encontrado");
    return client;
};
