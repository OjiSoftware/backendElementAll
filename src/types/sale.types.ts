export type CreateSaleInput = {
  clientId: number;  
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"; 
  details: {
    productId: number; 
    quantity: number;
    unitaryPrice: number; 
  }[];
};

export type UpdateSaleInput = {
  clientId?: number;      
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"; 
  details?: {
    productId: number;
    quantity?: number;     
    unitaryPrice?: number; 
  }[];
};