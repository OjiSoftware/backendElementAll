// src/services/client.service.ts
import * as clientRepo from "../repositories/client.repository";
import { Client as ClientModel } from "../generated/prisma/client";
import { CreateClientInput, UpdateClientInput } from "../types/client.types";

/**
 * Obtiene todos los clientes.
 * @returns Array de clientes.
 * @throws Error si no se pudieron obtener los clientes.
 */
export const getAllClients = async (): Promise<ClientModel[]> => {
    const clients = await clientRepo.findAllClients();

    if (!clients || clients.length === 0) {
        throw new Error("No hay clientes para mostrar");
    }

    return clients;
};

/**
 * Obtiene un cliente por su ID.
 * @param id - ID del cliente.
 * @returns Cliente encontrado.
 * @throws Error si el cliente no existe.
 */
export const getClientById = async (id: number): Promise<ClientModel> => {
    const client = await clientRepo.findClientById(id);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};

/**
 * Crea un nuevo cliente.
 * @param data - Datos del cliente a crear.
 * @returns Cliente creado con éxito.
 * @throws Error si no se puede crear el cliente.
 */
export const createClient = async (
    data: CreateClientInput,
): Promise<{ message: string; client: ClientModel }> => {
    const client = await clientRepo.createClient(data);

    return {
        message: "Cliente creado con éxito",
        client,
    };
};

/**
 * Actualiza un cliente existente.
 * @param id - ID del cliente a actualizar.
 * @param data - Datos a actualizar.
 * @returns Cliente actualizado con éxito.
 * @throws Error si el cliente no existe.
 */
export const updateClient = async (
    id: number,
    data: UpdateClientInput,
): Promise<{ message: string; client: ClientModel }> => {
    const updated = await clientRepo.updateClient(id, data);

    if (!updated) {
        throw new Error("Cliente no encontrado");
    }

    return {
        message: "Cliente actualizado con éxito",
        client: updated,
    };
};

/**
 * Elimina un cliente.
 * @param id - ID del cliente a eliminar.
 * @returns Cliente eliminado con éxito.
 * @throws Error si el cliente no existe.
 */
export const deleteClient = async (
    id: number,
): Promise<{ message: string; client: ClientModel }> => {
    const deleted = await clientRepo.deleteClient(id);

    if (!deleted) {
        throw new Error("Cliente no encontrado");
    }

    return {
        message: "Cliente eliminado con éxito",
        client: deleted,
    };
};
