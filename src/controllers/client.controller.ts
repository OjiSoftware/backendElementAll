import { Request, Response } from "express";
import * as service from "../services/client.service";

// GET /api/clients/:id
export const getClient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const client = await service.getClient(id);
        res.json(client);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

// POST /api/clients
export const createClient = async (req: Request, res: Response) => {
    try {
        const client = await service.createClient(req.body);
        res.status(201).json(client);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

// PUT /api/clients/:id
export const updateClient = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const client = await service.updateClient(id, req.body);
        res.json(client);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const getAllClients = async (_req:any, res:any) => {
  try {
    const clients = await service.getAllClients();
    res.json(clients);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
