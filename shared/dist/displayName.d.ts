/**
 * Nome para exibição: primeira letra de cada palavra em maiúscula (ex.: "John Deep").
 * Usa regras de capitalização do locale pt-BR.
 */
export declare function formatDisplayName(raw: string): string;
/** True se, após normalização, o nome tem pelo menos um caractere (rejeita só espaços). */
export declare function isNonEmptyDisplayName(raw: string): boolean;
