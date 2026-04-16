const hasUpper = (p: string): boolean => /[A-Z]/u.test(p);
const hasLower = (p: string): boolean => /[a-z]/u.test(p);
const hasDigit = (p: string): boolean => /[0-9]/u.test(p);
const hasSpecial = (p: string): boolean => /[^A-Za-z0-9]/u.test(p);

// Check if the password is strong
export const isStrongPassword = (password: string): boolean =>
  password.length >= 8 &&
  hasUpper(password) &&
  hasLower(password) &&
  hasDigit(password) &&
  hasSpecial(password);

// Password hint for password policy
export const passwordHint =
  'At least 8 characters, with uppercase, lowercase, number, and special character.';
