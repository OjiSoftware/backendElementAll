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
    transaction?: any;
};

export type CreateSaleInput = {
  clientId: number;
  addressId?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sendEmail?: boolean;
  details: {
    productId: number;
    quantity: number;
  }[];
};

export type UpdateSaleInput = {
  clientId?: number;
  addressId?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  sendEmail?: boolean;
  silent?: boolean;
  details?: {
    productId: number;
    quantity?: number;
  }[];
};
