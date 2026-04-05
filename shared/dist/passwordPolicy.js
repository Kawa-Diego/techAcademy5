"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHint = exports.isStrongPassword = void 0;
const hasUpper = (p) => /[A-Z]/u.test(p);
const hasLower = (p) => /[a-z]/u.test(p);
const hasDigit = (p) => /[0-9]/u.test(p);
const hasSpecial = (p) => /[^A-Za-z0-9]/u.test(p);
// Check if the password is strong
const isStrongPassword = (password) => password.length >= 8 &&
    hasUpper(password) &&
    hasLower(password) &&
    hasDigit(password) &&
    hasSpecial(password);
exports.isStrongPassword = isStrongPassword;
// Password hint for password policy
exports.passwordHint = 'At least 8 characters, with uppercase, lowercase, number, and special character.';
