type Client = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
};


type CreateClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;
type UpdateClientInput = Partial<CreateClientInput>;


export const getClientService = (clientId: number) => {
    return [];
}

export const createClientService = (data: CreateClientInput) => {
    return data;
}

export const updateClientService = (clientId: number, data: UpdateClientInput) => {
    return [];
}