import * as repo from "../repository/client.repository";

export const getClient = (id: number) => {
    const client = repo.findClientById(id);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};

export const createClient = (data: repo.CreateClientInput) => {
    return repo.insertClient(data);
};

export const updateClient = (id: number, data: repo.UpdateClientInput) => {
    const client = repo.updateClient(id, data);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};
