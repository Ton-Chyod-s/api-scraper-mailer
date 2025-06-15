
export type RegisterRequestDTO = {
    name: string;
    email: string;
    password: string;
    role?: string; // 'admin' or 'user', default is 'user'
}