export enum SaleStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export type Sale = {
    id: number;
    createdAt: Date;
    status: SaleStatus;
    clientId: number;
};

export type createSaleInput = Omit<Sale, "id" | "createdAt" | "status">;

export const createSaleService = (data: createSaleInput) => {
    return data;
}

export const getSaleService = (saleId: number) => {
    return [];
}

export const cancelSaleService = (saleId: number) => {
    return [];
}
