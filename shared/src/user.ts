// User role type for user public
export type UserRole = 'USER' | 'ADMIN';

// User public type
export type UserPublic = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly role: UserRole;
  readonly createdAt: string;
};

// Register user payload type for register user
export type RegisterUserPayload = {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly cpf: string;
};

// Login payload type for login
export type LoginPayload = {
  readonly email: string;
  readonly password: string;
};

// Forgot password payload type for forgot password
export type ForgotPasswordPayload = {
  readonly email: string;
  readonly newPassword: string;
};

// Login response type for login response
export type LoginResponse = {
  readonly token: string;
  readonly user: UserPublic;
};

// Update user payload type for update user
export type UpdateUserPayload = {
  readonly name: string;
  readonly password: string;
  readonly cpf: string;
};
