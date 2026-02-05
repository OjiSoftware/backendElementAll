type Client = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
};


type CreateClientInput = Omit<Client, "id" | "createdAt" | "updatedAt">;
type UpdateClientInput = Partial<CreateClientInput>;


export const getClientService = async (clientId: number) => {
    const clientData = await fetch(`api/client/${clientId}`);

    if (!clientData.ok) {
        throw new Error("Error al encontrar el cliente");
    }


    return clientData.json();
}

export const createClientService = async (data: CreateClientInput) => {

    const newClient = await fetch("api/client", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    return;
}

export const updateClientService = (clientId: number, data: UpdateClientInput) => {
    return [];
}