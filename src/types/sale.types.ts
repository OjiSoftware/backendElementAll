import {
    Sale,
    Client,
    BillAddress,
    SaleDetails,
    Product,
} from "../generated/prisma/client";


type SaleDetailWithProduct = SaleDetails & {
    product: Product;
};

export type SaleWithAll = Sale & {
    client: Client;
    address: BillAddress | null;
    details: SaleDetailWithProduct[];
};

export type CreateSaleInput = {
    clientId: number;
    addressId?: number;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    details: {
        productId: number;
        quantity: number;
    }[];
};

export type UpdateSaleInput = {
    clientId?: number;
    addressId?: number;
    status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    details?: {
        productId: number;
        quantity?: number;
    }[];
};
