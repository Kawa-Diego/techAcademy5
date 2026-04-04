import {
  isNonEmptyDisplayName,
  isStrongPassword,
  isValidCpf,
  isValidEmail,
  passwordHint,
} from '@ecommerce/shared';

type RegisterInput = {
  readonly name: string;
  readonly email: string;
  readonly cpf: string;
  readonly password: string;
  readonly confirm: string;
};

const rules: readonly [(input: RegisterInput) => boolean, string][] = [
  [(i) => !isNonEmptyDisplayName(i.name), 'Informe um nome válido'],
  [(i) => !isValidEmail(i.email), 'E-mail inválido'],
  [(i) => !isValidCpf(i.cpf), 'CPF inválido'],
  [(i) => !isStrongPassword(i.password), passwordHint],
  [(i) => i.password !== i.confirm, 'Senhas não conferem'],
];

export function collectRegisterClientErrors(input: RegisterInput): string[] {
  return rules
    .filter(([check]) => check(input))
    .map(([, message]) => message);
}
