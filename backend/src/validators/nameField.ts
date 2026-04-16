import { z } from 'zod';
import { formatDisplayName } from '@ecommerce/shared';

/** Nome com pelo menos um caractere visível após trim e capitalização pt-BR. */
export const zodNonEmptyDisplayName = z
  .string()
  .transform((s) => formatDisplayName(s))
  .refine((s) => s.length > 0, { message: 'Invalid name' });
