export type CreateSaleDetailsInput = {
  saleId: number;
  productId: number;
  quantity: number;
  unitaryPrice: number;
};

export type UpdateSaleDetailsInput = {
  saleId?: number;
  productId?: number;
  quantity?: number;
  unitaryPrice?: number;
};