export type FieldErrorDetail = {
    readonly field: string;
    readonly message: string;
};
export type ApiErrorBody = {
    readonly message: string;
    readonly details?: readonly FieldErrorDetail[];
};
