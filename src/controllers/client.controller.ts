/* import * as service from "../services/client.service";

export const getClient = (req: any, res: any) => {
    try {
        const client = service.getClient(Number(req.params.id));
        res.json(client);
    } catch (e:any) {
        res.status(404).json({ error: e.message });
    }
};

export const createClient = (req: any, res: any) => {
    const client = service.createClient(req.body);
    res.status(201).json(client);
};

export const updateClient = (req: any, res: any) => {
    try {
        const client = service.updateClient(
            Number(req.params.id),
            req.body
        );
        res.json(client);
    } catch (e:any) {
        res.status(404).json({ error: e.message });
    }
};
 */

// src/controllers/client.controller.ts
import * as service from "../services/client.service";


export const getAllClients = async (req: any, res: any) => {
    try {
        const clientes = await service.getAllClients();
        res.json(clientes)
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}
export const getClient = async (req: any, res: any) => {
    try {
        const client = await service.getClient(Number(req.params.id));
        res.json(client);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};

export const createClient = async (req: any, res: any) => {
    try {
        const client = await service.createClient(req.body);
        res.status(201).json(client);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
};

export const updateClient = async (req: any, res: any) => {
    try {
        const client = await service.updateClient(
            Number(req.params.id),
            req.body
        );
        res.json(client);
    } catch (e: any) {
        res.status(404).json({ error: e.message });
    }
};
