import { describe, expect, it } from 'vitest';
import { assertValidCpf } from '../../src/utils/cpf';
import { AppError } from '../../src/errors/AppError';

describe('assertValidCpf', () => {
  it('aceita CPF válido', () => {
    expect(() => assertValidCpf('390.533.447-05')).not.toThrow();
  });

  it('rejeita CPF inválido', () => {
    expect(() => assertValidCpf('111.111.111-11')).toThrow(AppError);
  });
});
