import { prisma } from "../prisma";
import { Client as ClientModel } from "../generated/prisma/client";
import { BillAddress as BillAddressModel } from "../generated/prisma/client";
import { CreateClientInput, UpdateClientInput } from "../types/client.types";

/**
 * Obtiene todos los clientes de la base de datos.
 * @returns Array de clientes.
 * @throws Error si falla la consulta a la base de datos.
 */
export const findAllClients = async (): Promise<ClientModel[]> => {
    try {
        return await prisma.client.findMany();
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        throw new Error("No se pudieron obtener los clientes");
    }
};

/**
 * Busca un cliente por su ID.
 * @param id - ID del cliente a buscar.
 * @returns Cliente encontrado o null si no existe.
 * @throws Error si falla la consulta.
 */
export const findClientById = async (
    id: number,
): Promise<ClientModel | null> => {
    try {
        return await prisma.client.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error(`Error al buscar cliente con id ${id}:`, error);
        throw new Error("No se pudo buscar el cliente");
    }
};

/**
 * Crea un nuevo cliente en la base de datos.
 * @param data - Objeto con los datos del cliente.
 * @returns Cliente recién creado.
 * @throws Error si falla la inserción.
 */
export const createClient = async (
    data: CreateClientInput,
): Promise<ClientModel> => {
    try {
        const { addresses, ...clientData } = data;

        const client = await prisma.client.create({
            data: {
                ...clientData,
                addresses: {
                    create: addresses
                }
            },
            include: {
                addresses: true,
            }
        });

        return client;
    } catch (error) {
        console.error("Error al crear cliente:", error);
        throw new Error("No se pudo crear el cliente");
    }
};

/**
 * Actualiza los datos de un cliente existente.
 * @param id - ID del cliente a actualizar.
 * @param data - Datos a actualizar.
 * @returns Cliente actualizado o null si no existe.
 */
export const updateClient = async (
    id: number,
    data: UpdateClientInput,
): Promise<ClientModel | null> => {
    try {
        const { addresses, ...clientData } = data;

        const client = await prisma.client.update({
            where: { id },
            data: {
                ...clientData,
                ...(addresses !== undefined ? {
                    addresses: {
                        deleteMany: {},
                        create: addresses as any,
                    }
                } : {})
            },
            include: {
                addresses: true,
            }
        });

        return client;
    } catch (error) {
        console.warn(
            `Cliente con id ${id} no encontrado o error al actualizar:`,
            error,
        );
        return null;
    }
};

/**
 * Elimina un cliente de la base de datos.
 * @param id - ID del cliente a eliminar.
 * @returns Cliente eliminado o null si no existe.
 */
export const deleteClient = async (id: number): Promise<ClientModel | null> => {
    try {
        return await prisma.client.delete({
            where: { id },
        });
    } catch (error) {
        console.warn(
            `Cliente con id ${id} no encontrado o error al eliminar:`,
            error,
        );
        return null;
    }
};
