type Client = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt: Date;
};


type CreateClientInput = Omit<Client, "id" | "createdAt">;
type UpdateClientInput = Partial<CreateClientInput>;


export const getClientService = async (clientId: number) => {
    const clientData = await fetch(`api/client/${clientId}`);

    if (!clientData.ok) {
        throw new Error("Error al encontrar el cliente");
    }

    const response = await clientData.json();

    return response;
}

export const createClientService = async (data: CreateClientInput) => {

    const newClient = await fetch("api/client", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    if (!newClient.ok) {
        throw new Error("Error al crear el cliente");
    }

    const response = await newClient.json();

    return response;
}

export const updateClientService = async (clientId: number, data: UpdateClientInput) => {

    const clientUpdated = await fetch(`api/client/${clientId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    if (!clientUpdated.ok) {
        throw new Error("Error al actualizar el cliente");
    }

    const response = await clientUpdated.json();

    return response;
}