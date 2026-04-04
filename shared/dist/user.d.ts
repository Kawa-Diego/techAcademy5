export type UserRole = 'USER' | 'ADMIN';
export type UserPublic = {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly cpf: string;
    readonly role: UserRole;
    readonly createdAt: string;
};
export type RegisterUserPayload = {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly cpf: string;
};
export type LoginPayload = {
    readonly email: string;
    readonly password: string;
};
/** Redefinição de senha por e-mail (sem token por e-mail; uso interno / demos). */
export type ForgotPasswordPayload = {
    readonly email: string;
    readonly newPassword: string;
};
export type LoginResponse = {
    readonly token: string;
    readonly user: UserPublic;
};
export type UpdateUserPayload = {
    readonly name: string;
    readonly password: string;
    readonly cpf: string;
};
