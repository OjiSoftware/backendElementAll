// src/controllers/client.controller.ts
import { Request, Response } from "express";
import * as clientService from "../services/client.service";

/**
 * Obtiene todos los clientes.
 */
export const getClients = async (_req: Request, res: Response) => {
    try {
        const clients = await clientService.getAllClients();
        res.json(clients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Obtiene un cliente por su ID.
 */
export const getClient = async (req: Request, res: Response) => {
    try {
        const client = await clientService.getClientById(Number(req.params.id));
        res.json(client);
    } catch (error: any) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

/**
 * Crea un nuevo cliente.
 */
export const createClient = async (req: Request, res: Response) => {
    try {
        const result = await clientService.createClient(req.body);
        res.status(201).json({
            message: result.message,
            client: result.client,
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Actualiza un cliente existente.
 */
export const updateClient = async (req: Request, res: Response) => {
    try {
        const result = await clientService.updateClient(
            Number(req.params.id),
            req.body,
        );
        res.json({
            message: result.message,
            client: result.client,
        });
    } catch (error: any) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al actualizar cliente" });
    }
};

/**
 * Elimina un cliente.
 */
export const deleteClient = async (req: Request, res: Response) => {
    try {
        const result = await clientService.deleteClient(Number(req.params.id));
        res.json({
            message: result.message,
            client: result.client,
        });
    } catch (error: any) {
        if (error.message === "Cliente no encontrado") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al eliminar cliente" });
    }
};
