// Profile form validation rules
import {
  isNonEmptyDisplayName,
  isStrongPassword,
  isValidCpf,
  passwordHint,
} from '@ecommerce/shared';

// Profile fields type for profile form validation
type ProfileFields = {
  readonly name: string;
  readonly cpf: string;
  readonly password: string;
  readonly confirm: string;
};

// Profile form validation rules
const rules: readonly [(f: ProfileFields) => boolean, string][] = [
  [(f) => !isNonEmptyDisplayName(f.name), 'Enter a valid name'],
  [(f) => !isValidCpf(f.cpf), 'Invalid CPF'],
  [(f) => !isStrongPassword(f.password), passwordHint],
  [(f) => f.password !== f.confirm, 'Passwords do not match'],
];

// Collect profile update errors for profile form validation
export function collectProfileUpdateErrors(input: ProfileFields): string[] {
  return rules
    .filter(([check]) => check(input))
    .map(([, message]) => message);
}
