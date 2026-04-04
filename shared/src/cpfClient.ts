/** Validação e máscara de CPF no cliente (cadastro / perfil). */

export const cpfDigitsOnly = (raw: string): string => raw.replace(/\D/g, '');

const onlyDigits = cpfDigitsOnly;

const allSame = (digits: string): boolean =>
  digits.split('').every((d) => d === digits[0]);

const checkDigit = (base: string, factor: number): number => {
  let sum = 0;
  for (let i = 0; i < base.length; i += 1) {
    sum += Number(base[i]) * (factor - i);
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};

/** Máscara visual: `000.000.000-00` (máx. 11 dígitos). */
export const formatCpfMasked = (raw: string): string => {
  const d = cpfDigitsOnly(raw).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  }
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export const isValidCpf = (raw: string): boolean => {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (allSame(cpf)) return false;
  const d1 = checkDigit(cpf.slice(0, 9), 10);
  const d2 = checkDigit(cpf.slice(0, 9) + String(d1), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
};
