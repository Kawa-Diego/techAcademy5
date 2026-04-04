import type { ReactElement } from 'react';
import { Phone } from 'lucide-react';

export const LandingContato = (): ReactElement => (
  <main className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:pt-36">
    <h1 className="mb-4 text-4xl font-bold text-slate-900">Contato</h1>
    <p className="mb-10 text-lg text-slate-600">
      Fale com a nossa equipe pelo WhatsApp ou visite nossas redes sociais.
    </p>
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        WhatsApp
      </p>
      <a
        href="https://wa.me/0000000000?text=Olá, gostaria de saber mais sobre os produtos."
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
