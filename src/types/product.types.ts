export type CreateProductInput = {
    name: string;
    description: string;
    unit: string;
    price: number;
    imageUrl: string;
    stock: number;
    brandId: number;
    subCategoryId: number;
    status?: boolean;
};

export type UpdateProductInput = {
    name?: string;
    description?: string;
    unit?: string;
    price?: number;
    imageUrl?: string;
    stock?: number;
    brandId?: number;
    subCategoryId?: number;
    status?: boolean;
};
