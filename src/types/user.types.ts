export type CreateUserInput = {
    email: string;
    password: string;
    name: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;
