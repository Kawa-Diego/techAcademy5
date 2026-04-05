import type { Category } from './category';
import type { SiteNavigationResponse } from './site';

// Public layout outlet context type for categories and navigation
export type PublicLayoutOutletContext = {
  readonly categories: readonly Category[];
  readonly navigation: SiteNavigationResponse | null;
};
