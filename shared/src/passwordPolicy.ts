const hasUpper = (p: string): boolean => /[A-Z]/u.test(p);
const hasLower = (p: string): boolean => /[a-z]/u.test(p);
const hasDigit = (p: string): boolean => /[0-9]/u.test(p);
const hasSpecial = (p: string): boolean => /[^A-Za-z0-9]/u.test(p);

export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 &&
  hasUpper(password) &&
  hasLower(password) &&
  hasDigit(password) &&
  hasSpecial(password);

export const passwordHint =
  'Mínimo 8 caracteres, com maiúscula, minúscula, número e especial.';
