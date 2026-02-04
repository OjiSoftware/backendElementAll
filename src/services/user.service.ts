type User = {
    id: number;
    username: string;
    password: string;
};


export const createUserService = (data: Omit<User, "id">) => {
    return data;
}

export const getUserService = (userId: number) => {
    return [];
}