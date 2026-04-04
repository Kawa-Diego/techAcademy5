import { useEffect, useRef, type ReactElement } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import type { Category, SiteNavigationResponse, SiteNavItem } from '@ecommerce/shared';
import { useAuth } from '../context/AuthContext';

type Props = {
  readonly navigation: SiteNavigationResponse | null;
  readonly categories: readonly Category[];
  readonly onLoginClick: () => void;
  readonly onRegisterClick: () => void;
};

const NavItem = ({ item }: { readonly item: SiteNavItem }): ReactElement => {
  if (item.kind === 'external') {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-indigo-400"
      >
        {item.label}
      </a>
    );
  }
  const hashIdx = item.path.indexOf('#');
  if (hashIdx !== -1) {
    const pathname = item.path.slice(0, hashIdx) || '/';
    const hash = item.path.slice(hashIdx + 1);
    return (
      <Link
        to={{ pathname, hash }}
        className="transition-colors hover:text-indigo-400"
      >
        {item.label}
      </Link>
    );
  }
  return (
    <Link to={item.path} className="transition-colors hover:text-indigo-400">
      {item.label}
    </Link>
  );
};

export const Navbar = ({
  navigation,
  categories,
  onLoginClick,
  onRegisterClick,
}: Props): ReactElement => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navRef = useRef<HTMLElement>(null);
  const categoriaId = searchParams.get('categoria') ?? '';
  const onShopPaths = location.pathname === '/' || location.pathname === '/vitrine';
  const activeCategory =
    onShopPaths && categoriaId.length > 0
      ? categories.find((c) => c.id === categoriaId)
      : undefined;

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }
      );
    }, el);
    return () => {
      ctx.revert();
    };
  }, []);

  const brand = navigation?.brand ?? { label: 'LUMIÈRE', path: '/' };
  const items = navigation?.nav ?? [];

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 w-full border-b border-white/10 bg-zinc-950/50 shadow-lg shadow-black/20 backdrop-blur-xl transition-colors"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link to={brand.path} className="shrink-0 cursor-pointer">
            <span className="text-xl font-black tracking-tight text-indigo-400 sm:text-2xl">
              {brand.label}
            </span>
          </Link>
          {activeCategory !== undefined ? (
            <>
              <span className="shrink-0 text-slate-600" aria-hidden>
                ›
              </span>
              <span
                className="min-w-0 truncate text-sm font-semibold text-amber-200/95 sm:text-base"
                title={activeCategory.name}
              >
                {activeCategory.name}
              </span>
            </>
          ) : null}
        </div>

        <div className="hidden items-center gap-8 font-medium text-slate-300 md:flex">
          {items.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {user ? (
            <Link
              to={user.role === 'ADMIN' ? '/dashboard' : '/orders'}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 sm:px-5"
            >
              Painel
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={onRegisterClick}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 sm:px-4"
              >
                Cadastrar
              </button>
              <button
                type="button"
                onClick={onLoginClick}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-indigo-500 active:scale-95 sm:px-5"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
