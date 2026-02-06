// src/controllers/user.controller.ts
import { Request, Response } from "express";
import * as service from "../services/user.service";

/**
 * GET por ID
 * Devuelve un usuario específico por su ID
 */
export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await service.getUserById(Number(req.params.id));
        res.json(user);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

/**
 * LISTAR todos
 * Devuelve todos los usuarios existentes
 */
export const listUsers = async (_req: Request, res: Response) => {
    try {
        const list = await service.listUsers();
        res.json(list);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

/**
 * CREAR usuario
 * Crea un usuario nuevo y devuelve mensaje + usuario
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        const result = await service.createUser(req.body);
        res.status(201).json(result); // { message: "...", user: {...} }
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

/**
 * ACTUALIZAR usuario
 * Actualiza un usuario existente y devuelve mensaje + usuario
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const result = await service.updateUser(
            Number(req.params.id),
            req.body,
        );
        res.json(result); // { message: "...", user: {...} }
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

/**
 * ELIMINAR usuario
 * Elimina un usuario y devuelve mensaje + usuario eliminado
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await service.deleteUser(Number(req.params.id));
        res.json(result); // { message: "...", user: {...} }
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};
