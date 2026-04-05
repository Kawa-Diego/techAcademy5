import { useEffect, useRef, type ReactElement } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import gsap from 'gsap';
import { ShoppingBag } from 'lucide-react';
import type { PublicLayoutOutletContext } from '@ecommerce/shared';
import { AboutSection } from '../../components/AboutSection';
import { ContactSection } from '../../components/ContactSection';
import { VitrineShopSection } from '../../components/VitrineShopSection';

export const LandingHome = (): ReactElement => {
  const heroRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { navigation } = useOutletContext<PublicLayoutOutletContext>();

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current.children,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.15,
      }
    );
  }, []);

  useEffect(() => {
    const h = location.hash;
    if (h !== '#about' && h !== '#contact') return;
    const id = h.slice(1);
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <div className="font-changa-landing">
      <main
        id="home"
        className="relative overflow-hidden px-4 pb-8 pt-28 sm:px-6 lg:pb-12 lg:pt-40"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-3xl" />

        <div
          ref={heroRef}
          className="relative z-10 mx-auto max-w-7xl text-center"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100/90">
            <span>The best shopping experience</span>
          </div>
          <h1 className="mb-6 text-4xl font-normal leading-[1.1] tracking-tight text-slate-50 sm:text-5xl lg:text-7xl">
            Discover products <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              extraordinary
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 lg:text-xl">
            Premium quality and innovative design within reach. A curated
            selection made for you.
          </p>
          <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#about"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-500/35 bg-zinc-900/70 px-6 py-3.5 text-sm font-bold text-amber-100 transition hover:border-amber-400/55 hover:bg-zinc-800 sm:w-auto sm:px-8 sm:py-4"
            >
              About the store
            </a>
            <a
              href="#collection"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-500/40 bg-zinc-900/80 px-6 py-3.5 text-sm font-bold text-amber-100 shadow-lg shadow-amber-900/20 transition hover:border-amber-400/60 hover:bg-zinc-800 sm:w-auto sm:px-8 sm:py-4"
            >
              <ShoppingBag className="h-5 w-5" />
              View collection
            </a>
            <Link
              to="/vitrine"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-900/40 sm:w-auto sm:px-8 sm:py-4"
            >
              Open shop
            </Link>
          </div>
        </div>
      </main>

      <AboutSection />

      <VitrineShopSection showHeading />

      <ContactSection navigation={navigation} />
    </div>
  );
};
