export interface LoginUser {
    email: string,
    password: string,
}

export interface RegistrationUser {
    email: string,
    password: string,
    first_name: string,
    last_name: string,
}

export type User = {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
}
