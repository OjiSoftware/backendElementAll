export type CreateSubCategoryInput = {
    name: string;
    categoryId: number;
    status?: boolean;
};

export type UpdateSubCategoryInput = {
    name?: string;
    categoryId?: number;
    status?: boolean;
};
