import { describe, expect, it } from 'vitest';
import { assertStrongPassword } from '../../src/utils/password';
import { AppError } from '../../src/errors/AppError';

describe('assertStrongPassword', () => {
  it('aceita senha forte', () => {
    expect(() => assertStrongPassword('Abcd1!xx')).not.toThrow();
  });

  it('rejeita senha curta', () => {
    expect(() => assertStrongPassword('Ab1!')).toThrow(AppError);
  });
});
