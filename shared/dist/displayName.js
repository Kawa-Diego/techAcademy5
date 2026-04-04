"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDisplayName = formatDisplayName;
/**
 * Nome para exibição: primeira letra de cada palavra em maiúscula (ex.: "John Deep").
 * Usa regras de capitalização do locale pt-BR.
 */
function formatDisplayName(raw) {
    const s = raw.trim();
    if (s.length === 0)
        return '';
    return s
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => {
        const lower = word.toLocaleLowerCase('pt-BR');
        return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
        .join(' ');
}
