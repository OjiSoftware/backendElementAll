// src/types/client.types.ts

export type CreateClientInput = {
    name: string;
    surname: string;
    dni: string;
    phoneNumber: string;
    email: string;
    addresses: {
        street: string;
        streetNum: number;
        floor?: number;
        apartment?: string;
        locality: string;
        province: string;
        reference?: string;
    }
};

export type UpdateClientInput = {
    name?: string;
    surname?: string;
    dni?: string;
    phoneNumber?: string;
    email?: string;
    addresses?: {
        street?: string;
        streetNum?: number;
        floor?: number;
        apartment?: string;
        locality?: string;
        province?: string;
        reference?: string;
    }
};
