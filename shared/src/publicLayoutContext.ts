import type { Category } from './category';
import type { SiteNavigationResponse } from './site';

export type PublicLayoutOutletContext = {
  readonly categories: readonly Category[];
  readonly navigation: SiteNavigationResponse | null;
};
