// Regex for email validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/u;

export const isValidEmail = (email: string): boolean =>
  EMAIL_REGEX.test(email.trim());
