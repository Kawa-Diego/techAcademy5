"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCents = void 0;
const formatCents = (cents) => (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
exports.formatCents = formatCents;
