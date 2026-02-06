// src/types/client.types.ts

export type CreateClientInput = {
    name: string;
    surname: string;
    dni: string;
    phoneNumber: number;
    email: string;
};

export type UpdateClientInput = Partial<CreateClientInput>;
