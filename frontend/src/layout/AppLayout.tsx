import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import type { AppMenuResponse } from '@ecommerce/shared';
import { useAuth } from '../context/AuthContext';
import { httpJson } from '../services/http';

function isActiveMenuPath(menuPath: string, pathname: string): boolean {
  if (pathname === menuPath) return true;
  if (menuPath === '/' || menuPath.length === 0) return false;
  return pathname.startsWith(`${menuPath}/`);
}

const linkDesktop =
  'relative z-10 inline-block shrink-0 rounded-md px-2 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-indigo-400 sm:text-base';
const linkMobile =
  'relative z-10 rounded-lg px-3 py-2.5 text-slate-200 transition hover:bg-white/10 hover:text-indigo-300';

function MenuToggleIcon({ open }: { readonly open: boolean }): ReactElement {
  return (
    <span className="relative block h-5 w-6" aria-hidden>
      <span
        className={`absolute left-0 top-[3px] block h-0.5 w-6 origin-center rounded-full bg-slate-200 transition-all duration-300 ease-out ${
          open ? 'top-[9px] rotate-45' : ''
        }`}
      />
      <span
        className={`absolute left-0 top-[9px] block h-0.5 w-6 rounded-full bg-slate-200 transition-opacity duration-300 ease-out ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute left-0 top-[15px] block h-0.5 w-6 origin-center rounded-full bg-slate-200 transition-all duration-300 ease-out ${
          open ? 'top-[9px] -rotate-45' : ''
        }`}
      />
    </span>
  );
}

export const AppLayout = (): ReactElement => {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const [menu, setMenu] = useState<AppMenuResponse | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navTrackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token === null) {
      setMenu(null);
      return;
    }
    void httpJson<AppMenuResponse>(
      '/site/app-menu',
      { method: 'GET' },
      token
    )
      .then(setMenu)
      .catch(() => setMenu(null));
  }, [token]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const updateDesktopIndicator = useCallback(() => {
    const track = navTrackRef.current;
    const indicator = indicatorRef.current;
    if (track === null || indicator === null || menu === null) return;

    const pathname = location.pathname;
    const active = menu.items.find((item) =>
      isActiveMenuPath(item.path, pathname)
    );
    const activeEl = active !== undefined ? linkRefs.current[active.path] : null;

    if (activeEl === null || activeEl === undefined) {
      gsap.to(indicator, {
        opacity: 0,
        width: 0,
        duration: 0.25,
        ease: 'power2.in',
      });
      return;
    }

    const tRect = track.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    const left = aRect.left - tRect.left + track.scrollLeft;
    const width = aRect.width;

    gsap.to(indicator, {
      opacity: 1,
      left: left,
      width: width,
      duration: 0.45,
      ease: 'power2.out',
    });
  }, [location.pathname, menu]);

  useLayoutEffect(() => {
    updateDesktopIndicator();
  }, [updateDesktopIndicator]);

  useEffect(() => {
    const track = navTrackRef.current;
    if (track === null) return;
    const onScroll = (): void => {
      updateDesktopIndicator();
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(() => updateDesktopIndicator());
    ro.observe(track);
    window.addEventListener('resize', updateDesktopIndicator);
    return () => {
      track.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', updateDesktopIndicator);
    };
  }, [updateDesktopIndicator]);

  useLayoutEffect(() => {
    const el = mainRef.current;
    if (el === null) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen || menu === null) return;
    const root = mobileNavRef.current;
    if (root === null) return;
    const links = root.querySelectorAll('[data-mobile-nav-link]');
    gsap.fromTo(
      links,
      { x: -16, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
        delay: 0.05,
      }
    );
  }, [mobileOpen, menu]);

  const closeMobile = (): void => {
    setMobileOpen(false);
  };

  const pathname = location.pathname;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/25 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              to="/"
              onClick={closeMobile}
              className="shrink-0 rounded-lg border border-slate-200/90 bg-white/95 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Página principal
            </Link>
          </div>

          <div
            ref={navTrackRef}
            className="relative hidden min-h-[2.75rem] min-w-0 flex-1 items-center md:flex md:max-w-[min(100%,42rem)] md:flex-nowrap md:gap-1 md:overflow-x-auto md:py-1 md:[scrollbar-width:thin]"
          >
            {menu === null ? (
              <span className="text-sm text-slate-500">Carregando menu…</span>
            ) : (
              menu.items.map((item) => {
                const active = isActiveMenuPath(item.path, pathname);
                return (
                  <Link
                    key={item.path}
                    ref={(el) => {
                      linkRefs.current[item.path] = el;
                    }}
                    to={item.path}
                    className={`${linkDesktop} ${active ? 'text-indigo-300' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })
            )}
            <span
              ref={indicatorRef}
              className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-indigo-400 opacity-0 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
              style={{ width: 0 }}
              aria-hidden
            />
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <span className="max-w-[10rem] truncate text-sm text-slate-400">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-400/90 transition hover:bg-red-950/50 hover:text-red-300"
            >
              Sair
            </button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-nav"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <MenuToggleIcon open={mobileOpen} />
          </button>
        </div>

        <div
          id="app-mobile-nav"
          className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden ${
            mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`border-t border-white/10 bg-zinc-950/60 px-4 pb-4 pt-1 sm:px-6 ${
                mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              <nav
                ref={mobileNavRef}
                className="relative flex flex-col gap-0.5 py-3"
                aria-label="Menu da aplicação"
              >
                {menu === null ? (
                  <span className="px-3 py-2 text-sm text-slate-500">Carregando menu…</span>
                ) : (
                  menu.items.map((item) => {
                    const active = isActiveMenuPath(item.path, pathname);
                    return (
                      <Link
                        key={item.path}
                        data-mobile-nav-link
                        to={item.path}
                        onClick={closeMobile}
                        className={`${linkMobile} border-l-2 pl-3 ${
                          active
                            ? 'border-amber-400 bg-white/5 text-amber-100'
                            : 'border-transparent'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })
                )}
              </nav>
              <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                <span className="truncate px-3 text-sm text-slate-400">{user?.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    closeMobile();
                    logout();
                  }}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400/90 transition hover:bg-red-950/40 hover:text-red-300"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main
        ref={mainRef}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
      >
        <Outlet />
      </main>
    </div>
  );
};
