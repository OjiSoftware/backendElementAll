export type CreateBrandInput = {
    name: string;
};

export type UpdateBrandInput = Partial<CreateBrandInput> & {
    status?: boolean;
};
