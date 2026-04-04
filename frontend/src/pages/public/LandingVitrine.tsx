import type { ReactElement } from 'react';
import { VitrineShopSection } from '../../components/VitrineShopSection';

export const LandingVitrine = (): ReactElement => (
  <main className="min-h-screen pt-24">
    <VitrineShopSection showHeading={false} />
  </main>
);
