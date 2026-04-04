import {
  isNonEmptyDisplayName,
  isStrongPassword,
  isValidCpf,
  passwordHint,
} from '@ecommerce/shared';

type ProfileFields = {
  readonly name: string;
  readonly cpf: string;
  readonly password: string;
  readonly confirm: string;
};

const rules: readonly [(f: ProfileFields) => boolean, string][] = [
  [(f) => !isNonEmptyDisplayName(f.name), 'Informe um nome válido'],
  [(f) => !isValidCpf(f.cpf), 'CPF inválido'],
  [(f) => !isStrongPassword(f.password), passwordHint],
  [(f) => f.password !== f.confirm, 'Senhas não conferem'],
];

export function collectProfileUpdateErrors(input: ProfileFields): string[] {
  return rules
    .filter(([check]) => check(input))
    .map(([, message]) => message);
}
