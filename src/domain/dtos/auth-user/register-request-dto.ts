
export type RegisterRequestDTO = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string; // 'admin' or 'user', default is 'user'
}