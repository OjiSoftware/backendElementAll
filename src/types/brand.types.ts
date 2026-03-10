export type CreateBrandInput = {
    name: string;
    /*   subCategoryId: number; */
};

export type UpdateBrandInput = Partial<CreateBrandInput> & {
    status?: boolean;
};
