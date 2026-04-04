"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordHint = exports.isStrongPassword = void 0;
const hasUpper = (p) => /[A-Z]/u.test(p);
const hasLower = (p) => /[a-z]/u.test(p);
const hasDigit = (p) => /[0-9]/u.test(p);
const hasSpecial = (p) => /[^A-Za-z0-9]/u.test(p);
const isStrongPassword = (password) => password.length >= 8 &&
    hasUpper(password) &&
    hasLower(password) &&
    hasDigit(password) &&
    hasSpecial(password);
exports.isStrongPassword = isStrongPassword;
exports.passwordHint = 'Mínimo 8 caracteres, com maiúscula, minúscula, número e especial.';
