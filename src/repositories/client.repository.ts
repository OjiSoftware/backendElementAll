import { prisma } from "../prisma";
import { Client as ClientModel } from "../generated/prisma/client";
import { CreateClientInput, UpdateClientInput } from "../types/client.types";

/**
 * Obtiene todos los clientes de la base de datos.
 */
export const findAllClients = async (): Promise<ClientModel[]> => {
    try {
        return await prisma.client.findMany({
            include: { addresses: true },
        });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        throw new Error("No se pudieron obtener los clientes");
    }
};

/**
 * Busca un cliente por su ID.
 */
export const findClientById = async (
    id: number,
): Promise<ClientModel | null> => {
    try {
        return await prisma.client.findUnique({
            where: { id },
            include: { addresses: true },
        });
    } catch (error) {
        console.error(`Error al buscar cliente con id ${id}:`, error);
        throw new Error("No se pudo buscar el cliente");
    }
};

/**
 * Crea o actualiza un cliente en la base de datos (Upsert).
 */
export const createClient = async (
    data: CreateClientInput,
): Promise<ClientModel> => {
    try {
        const { addresses, ...clientData } = data;

        // Preparamos el bloque de la dirección mapeando campo por campo
        const addressBlock = addresses
            ? {
                  create: {
                      street: addresses.street,
                      streetNum: addresses.streetNum,
                      floor: addresses.floor,
                      apartment: addresses.apartment,
                      locality: addresses.locality,
                      province: addresses.province,
                      reference: addresses.reference,
                      postalCode: addresses.postalCode || "S/N", // 👈 Valores seguros
                      country: addresses.country || "Argentina", // 👈 Valores seguros
                  },
              }
            : undefined;

        const client = await prisma.client.upsert({
            where: { dni: clientData.dni },
            update: {
                ...clientData,
                ...(addressBlock ? { addresses: addressBlock } : {}),
            },
            create: {
                ...clientData,
                ...(addressBlock ? { addresses: addressBlock } : {}),
            },
            include: {
                addresses: true,
            },
        });

        return client;
    } catch (error) {
        console.error("Error al procesar cliente (upsert):", error);
        throw new Error("No se pudo procesar la información del cliente");
    }
};

/**
 * Actualiza los datos de un cliente existente.
 */
export const updateClient = async (
    id: number,
    data: UpdateClientInput,
): Promise<ClientModel | null> => {
    try {
        const { addresses, ...clientData } = data;

        // Preparamos el bloque de la dirección mapeando campo por campo
        const addressBlock = addresses
            ? {
                  create: {
                      street: addresses.street || "Sin especificar",
                      streetNum: addresses.streetNum || 0,
                      floor: addresses.floor,
                      apartment: addresses.apartment,
                      locality: addresses.locality || "Sin especificar",
                      province: addresses.province || "Sin especificar",
                      reference: addresses.reference,
                      postalCode: addresses.postalCode || "S/N",
                      country: addresses.country || "Argentina",
                  },
              }
            : undefined;

        const client = await prisma.client.update({
            where: { id },
            data: {
                ...clientData,
                ...(addressBlock ? { addresses: addressBlock } : {}),
            },
            include: {
                addresses: true,
            },
        });

        return client;
    } catch (error) {
        console.warn(`Error al actualizar cliente con id ${id}:`, error);
        throw new Error("No se pudo actualizar el cliente");
    }
};

/**
 * Elimina un cliente de la base de datos.
 */
export const deleteClient = async (id: number): Promise<ClientModel | null> => {
    try {
        return await prisma.client.delete({
            where: { id },
        });
    } catch (error) {
        console.warn(`Error al eliminar cliente con id ${id}:`, error);
        return null;
    }
};
