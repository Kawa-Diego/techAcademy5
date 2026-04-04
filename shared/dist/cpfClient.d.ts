/** Validação e máscara de CPF no cliente (cadastro / perfil). */
export declare const cpfDigitsOnly: (raw: string) => string;
/** Máscara visual: `000.000.000-00` (máx. 11 dígitos). */
export declare const formatCpfMasked: (raw: string) => string;
export declare const isValidCpf: (raw: string) => boolean;
