import {
  isNonEmptyDisplayName,
  isStrongPassword,
  isValidCpf,
  isValidEmail,
  passwordHint,
} from '@ecommerce/shared';

// Register input type for register client validation
type RegisterInput = {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  readonly confirm: string;
};

// Register client validation rules for register client validation
const rules: readonly [(input: RegisterInput) => boolean, string][] = [
  [(i) => !isNonEmptyDisplayName(i.name), 'Enter a valid name'],
  [(i) => !isValidEmail(i.email), 'Invalid email'],
  [(i) => !isValidCpf(i.cpf), 'Invalid CPF'],
  [(i) => !isStrongPassword(i.password), passwordHint],
  [(i) => i.password !== i.confirm, 'Passwords do not match'],
];

// Collect register client errors for register client validation
export function collectRegisterClientErrors(input: RegisterInput): string[] {
  return rules
    .filter(([check]) => check(input))
    .map(([, message]) => message);
}
