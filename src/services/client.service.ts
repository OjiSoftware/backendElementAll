import * as repo from "../repository/client.repository";

export const getClient = async (id: number) => {
    const client = await repo.findClientById(id);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};

export const createClient = (data: repo.CreateClientInput) => {
    return repo.insertClient(data);
};

export const updateClient = async (id: number, data: repo.UpdateClientInput) => {
    const client = await repo.updateClient(id, data);

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    return client;
};

export const getAllClients = async () => {
  return repo.findAllClients();
}
