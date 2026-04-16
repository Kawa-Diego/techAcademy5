import { useEffect, useRef, type ReactElement } from 'react';
import gsap from 'gsap';
import { ShoppingBag } from 'lucide-react';

type Props = {
  readonly className?: string;
};

export const AboutSection = ({ className = '' }: Props): ReactElement => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (el === null) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll('[data-about-animate]'), {
        y: 28,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.05,
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="about"
      className={`scroll-mt-24 px-4 py-16 sm:px-6 lg:scroll-mt-28 lg:py-24 ${className}`.trim()}
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border-2 border-amber-500/45 bg-zinc-950/55 p-6 shadow-[0_0_32px_-8px_rgba(245,158,11,0.18)] sm:p-10 lg:p-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6">
              <h2
                id="about-heading"
                data-about-animate
                className="text-3xl font-bold tracking-tight text-slate-50 lg:text-4xl xl:text-5xl"
              >
                About our store
              </h2>
              <div
                data-about-animate
                className="h-1.5 w-20 rounded-full bg-gradient-to-r from-amber-400 to-indigo-500"
              />
              <p
                data-about-animate
                className="text-lg leading-relaxed text-slate-300"
              >
                Our mission is to bring you the best products with the best
                shopping experience possible. We work with exclusive brands,
                hand-picked to ensure quality, durability, and superior design.
              </p>
              <p
                data-about-animate
                className="text-lg leading-relaxed text-slate-300"
              >
                We are here to change how you shop online, with personalized
                service and fast delivery nationwide.
              </p>
            </div>
            <div data-about-animate className="relative">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-amber-500/30 bg-zinc-900/80">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-indigo-900/60 to-amber-900/30">
                  <ShoppingBag className="h-28 w-28 text-amber-400/40 sm:h-32 sm:w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
