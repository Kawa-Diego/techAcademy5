// Transform the display name to the first letter of each word in uppercase
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

// Check if the display name is not empty
export function isNonEmptyDisplayName(raw: string): boolean {
  return formatDisplayName(raw).length > 0;
}
