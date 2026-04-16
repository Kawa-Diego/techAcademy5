import { useEffect, useRef, type ReactElement } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone } from 'lucide-react';
import type { SiteNavigationResponse } from '@ecommerce/shared';
import { SocialNetworkIcon } from './SocialNetworkIcon';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  readonly navigation: SiteNavigationResponse | null;
};

export const ContactSection = ({ navigation }: Props): ReactElement => {
  const rootRef = useRef<HTMLElement>(null);
  const footer = navigation?.footer;

  useEffect(() => {
    const el = rootRef.current;
    if (el === null) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-contact-animate]'), {
        y: 32,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });
    }, el);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="contact"
      className="scroll-mt-24 px-4 py-16 sm:px-6 lg:scroll-mt-28 lg:py-24"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border-2 border-amber-500/45 bg-zinc-950/55 p-6 shadow-[0_0_32px_-8px_rgba(245,158,11,0.18)] sm:p-10 lg:p-12">
          <h2
            id="contact-heading"
            data-contact-animate
            className="mb-3 text-3xl font-bold tracking-tight text-slate-50 lg:text-4xl"
          >
            Contact
          </h2>
          <p
            data-contact-animate
            className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-300"
          >
            Reach our team on WhatsApp or visit our social profiles.
          </p>
          {footer ? (
            <div
              data-contact-animate
              className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8"
            >
              <a
                href={footer.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl border border-emerald-500/35 bg-emerald-950/30 px-6 py-4 text-lg font-semibold text-emerald-200 transition hover:border-emerald-400/50 hover:bg-emerald-950/50"
              >
                <Phone className="h-6 w-6 shrink-0" aria-hidden />
                <span>{footer.whatsappDisplay}</span>
              </a>
              <div className="flex gap-4">
                {footer.social.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-900/80 text-amber-200/90 transition hover:border-amber-400/50 hover:bg-zinc-800"
                    aria-label={s.label}
                  >
                    <SocialNetworkIcon id={s.id} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <p data-contact-animate className="text-slate-500">
              Loading contact information…
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
