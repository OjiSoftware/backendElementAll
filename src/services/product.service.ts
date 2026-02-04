type Product = {
    id: number;
    description: string;
    unit: string;
    price: number;
    status: boolean;
    createdAt: Date;
    imageUrl: string;
    stock: number;
    subCategoryId?: number;
};


type CreateProductInput = Omit<Product, "id" | "createdAt" | "status">;
type UpdateProductInput = Partial<CreateProductInput>;



export const getProductService = (productId: number) => {
    return [];
}

export const createProductService = (data: CreateProductInput) => {
    return data;
}

export const updateProductService = (productId: number, data: UpdateProductInput) => {
    return [];
}

export const getProductsService = () => {
    return [];
}

export const deleteProductService = (productId: number) => {
    return;
}