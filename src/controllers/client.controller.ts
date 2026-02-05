import * as service from "../services/client.service";

export const getClient = (req: any, res: any) => {
    try {
        const client = service.getClient(Number(req.params.id));
        res.json(client);
    } catch (e) {
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
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
};
