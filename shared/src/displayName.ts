/**
 * Nome para exibição: primeira letra de cada palavra em maiúscula (ex.: "John Deep").
 * Usa regras de capitalização do locale pt-BR.
 */
export function formatDisplayName(raw: string): string {
  const s = raw.trim();
  if (s.length === 0) return '';
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
    .join(' ');
}

/** True se, após normalização, o nome tem pelo menos um caractere (rejeita só espaços). */
export function isNonEmptyDisplayName(raw: string): boolean {
  return formatDisplayName(raw).length > 0;
}
