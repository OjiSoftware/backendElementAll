export type CreateBillAddressInput = {
  street: string;
  streetNum: number;
  floor?: number;
  apartment?: string;
  locality: string;
  province: string;
  reference?: string;
  clientId: number;
};

export type UpdateBillAddressInput = {
  street?: string;
  streetNum?: number;
  floor?: number;
  apartment?: string;
  locality?: string;
  province?: string;
  reference?: string;
  clientId?: number;
};