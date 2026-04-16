import { AppError } from '../errors/AppError';

const onlyDigits = (raw: string): string => raw.replace(/\D/g, '');

const allSameDigit = (digits: string): boolean => {
  return digits.split('').every((d) => d === digits[0]);
};

const calcCheck = (base: string, factor: number): number => {
  let sum = 0;
  for (let i = 0; i < base.length; i += 1) {
    sum += Number(base[i]) * (factor - i);
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
};

export const assertValidCpf = (raw: string): void => {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) throw new AppError(400, 'Invalid CPF');
  if (allSameDigit(cpf)) throw new AppError(400, 'Invalid CPF');
  const d1 = calcCheck(cpf.slice(0, 9), 10);
  const d2 = calcCheck(cpf.slice(0, 9) + String(d1), 11);
  if (d1 !== Number(cpf[9]) || d2 !== Number(cpf[10])) {
    throw new AppError(400, 'Invalid CPF');
  }
};

