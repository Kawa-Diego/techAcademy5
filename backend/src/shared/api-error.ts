// Error details type
export type FieldErrorDetail = {
  readonly field: string;
  readonly message: string;
};

// Api error body type
export type ApiErrorBody = {
  readonly message: string;
  readonly details?: readonly FieldErrorDetail[];
};
