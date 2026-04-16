import type { ReactElement } from 'react';
import { Phone } from 'lucide-react';

export const LandingContato = (): ReactElement => (
  <main className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:pt-36">
    <h1 className="mb-4 text-4xl font-bold text-slate-900">Contact</h1>
    <p className="mb-10 text-lg text-slate-600">
      Reach our team on WhatsApp or visit our social profiles.
    </p>
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        WhatsApp
      </p>
      <a
        href="https://wa.me/0000000000?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20your%20products."
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-600 hover:text-emerald-700"
      >
        <Phone className="h-6 w-6" />
        (00) 0000-0000
      </a>

      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Instagram
      </p>
      <a
        href="https://www.instagram.com"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-600 hover:text-emerald-700"
      >
      </a>
    </div>
  </main>
);
