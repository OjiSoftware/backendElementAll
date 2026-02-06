/* export type Client = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
};

export type CreateClientInput = Omit<Client, "id" | "createdAt">;
export type UpdateClientInput = Partial<CreateClientInput>;

let clients: Client[] = [];
let idCounter = 1;

export const findClientById = (id: number) =>
    clients.find(c => c.id === id);

export const insertClient = (data: CreateClientInput): Client => {
    const newClient: Client = {
        id: idCounter++,
        createdAt: new Date(),
        ...data,
    };

    clients.push(newClient);
    return newClient;
};

export const updateClient = (
    id: number,
    data: UpdateClientInput
) => {
    const client = clients.find(c => c.id === id);
    if (!client) return null;

    Object.assign(client, data);
    return client;
};
 */


import { PrismaClient } from "../generated/prisma"; // desde src/repository
export const prisma = new PrismaClient();

export type CreateClientInput = {
    name: string;
    surname: string;
    dni: string;
    phoneNumber: number;
    email: string;
};

export type UpdateClientInput = Partial<CreateClientInput>;

export const findClientById = async (id: number) => {
    return prisma.client.findUnique({
        where: { id },
    });
};

export const insertClient = async (data: CreateClientInput) => {
    return prisma.client.create({
        data,
    });
};

export const updateClient = async (id: number, data: UpdateClientInput) => {
    return prisma.client.update({
        where: { id },
        data,
    });
};
