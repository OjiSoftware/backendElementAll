// src/controllers/user.controller.ts
import { Request, Response } from "express";
import * as service from "../services/user.service";

/**
 * Función auxiliar para limpiar datos sensibles
 */
const filterUser = (user: any) => {
    if (!user) return null;
    const { password, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await service.getUserById(Number(req.params.id));
        res.json(filterUser(user));
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    try {
        const list = await service.listUsers();
        // Limpiamos cada usuario de la lista
        const safeList = list.map((u: any) => filterUser(u));
        res.json(safeList);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const result = await service.createUser(req.body);
        res.status(201).json({
            message: result.message,
            user: filterUser(result.user),
        });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const result = await service.updateUser(
            Number(req.params.id),
            req.body,
        );
        res.json({
            message: result.message,
            user: filterUser(result.user),
        });
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await service.deleteUser(Number(req.params.id));
        res.json({
            message: result.message,
            user: filterUser(result.user),
        });
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};
