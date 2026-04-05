"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCpf = exports.formatCpfMasked = exports.cpfDigitsOnly = void 0;
const cpfDigitsOnly = (raw) => raw.replace(/\D/g, '');
exports.cpfDigitsOnly = cpfDigitsOnly;
const onlyDigits = exports.cpfDigitsOnly;
const allSame = (digits) => digits.split('').every((d) => d === digits[0]);
// Check digit for cpf validation
const checkDigit = (base, factor) => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
        sum += Number(base[i]) * (factor - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
};
// Mask cpf XXX.XXX.XXX-XX
const formatCpfMasked = (raw) => {
    const d = (0, exports.cpfDigitsOnly)(raw).slice(0, 11);
    if (d.length <= 3)
        return d;
    if (d.length <= 6)
        return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) {
        return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    }
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};
exports.formatCpfMasked = formatCpfMasked;
// Validate cpf
const isValidCpf = (raw) => {
    const cpf = onlyDigits(raw);
    if (cpf.length !== 11)
        return false;
    if (allSame(cpf))
        return false;
    const d1 = checkDigit(cpf.slice(0, 9), 10);
    const d2 = checkDigit(cpf.slice(0, 9) + String(d1), 11);
    return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
};
exports.isValidCpf = isValidCpf;
