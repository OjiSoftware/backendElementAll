export type CreateUserInput = {
    username: string;
    password: string;
}

export type UpdateUserInput = Partial<CreateUserInput>

