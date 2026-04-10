import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Link, useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import type { PaginatedResult, PublicProduct } from '@ecommerce/shared';
import { ImageCarousel } from './ImageCarousel';
import { ApiRequestError, httpJson } from '../services/http';
import type { PublicLayoutOutletContext } from '@ecommerce/shared';

const formatPrice = (cents: number): string =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'BRL',
  });

type Props = {
  readonly showHeading?: boolean;
};

export const VitrineShopSection = ({
  showHeading = true,
}: Props): ReactElement => {
  const { categories } = useOutletContext<PublicLayoutOutletContext>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria') ?? '';
  const basePath = location.pathname === '/vitrine' ? '/vitrine' : '/';

  const [result, setResult] = useState<PaginatedResult<PublicProduct> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async (): Promise<void> => {
      setError(null);
      setResult(null);
      try {
        const qs = new URLSearchParams({ page: '1', pageSize: '24' });
        if (categoriaId.length > 0) qs.set('categoria', categoriaId);
        const res = await httpJson<PaginatedResult<PublicProduct>>(
          `/public/products?${qs.toString()}`,
          { method: 'GET' },
          null
        );
        setResult(res);
      } catch (e) {
        if (e instanceof ApiRequestError) setError(e.message);
        else setError('Could not load products');
      }
    })();
  }, [categoriaId]);

  useEffect(() => {
    const data = result?.data;
    if (data === undefined || data.length === 0) return;
    const cards = gridRef.current?.querySelectorAll('[data-vitrine-card]');
    if (cards === undefined || cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power2.out',
      }
    );
  }, [result]);

  const onStripWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    const el = stripRef.current;
    if (el === null) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  return (
    <section
      id="collection"
      className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-12"
    >
      {showHeading ? (
        <div className="mx-auto mb-10 max-w-7xl text-center">
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-50 lg:text-4xl">
            Our collection
          </h2>
          <p className="text-slate-400">
            Pick a category and explore the products
          </p>
        </div>
      ) : (
        <div className="mx-auto mb-8 max-w-7xl text-center lg:pt-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-50 lg:text-4xl">
            Shop
          </h1>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div
          ref={stripRef}
          onWheel={onStripWheel}
          className="mb-10 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:scrollbar-thin md:[scrollbar-width:thin] md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-amber-600/50 md:[&::-webkit-scrollbar-track]:bg-zinc-800"
        >
          <Link
            to={basePath}
            className={`shrink-0 snap-start rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
              categoriaId === ''
                ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                : 'border-amber-500/35 bg-zinc-950/60 text-slate-300 hover:border-amber-400/50 hover:text-amber-100'
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={{ pathname: basePath, search: `?categoria=${c.id}` }}
              className={`shrink-0 snap-start rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                categoriaId === c.id
                  ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                  : 'border-amber-500/35 bg-zinc-950/60 text-slate-300 hover:border-amber-400/50 hover:text-amber-100'
            }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {error ? (
          <p
            className="error-banner border border-red-500/30 bg-red-950/40 text-center text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!result ? (
          <p className="py-16 text-center text-slate-500">Loading…</p>
        ) : result.data.length === 0 ? (
          <div className="rounded-xl border-2 border-amber-500/40 bg-zinc-950/50 px-6 py-16 text-center text-slate-400">
            No products in this category.
          </div>
        ) : (
          <div className="rounded-xl border-2 border-amber-500/45 bg-zinc-950/40 p-3 shadow-[0_0_28px_-6px_rgba(245,158,11,0.15)] sm:p-5">
            <div
              ref={gridRef}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {result.data.map((p) => (
                <Link
                  key={p.id}
                  data-vitrine-card
                  to={`/vitrine/${p.id}`}
                  className="group block overflow-hidden rounded-2xl border border-amber-500/25 bg-zinc-900/50 transition hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-900/20"
                >
                  <div className="relative aspect-square overflow-hidden bg-zinc-800">
                    {p.outOfStock ? (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md sm:text-xs">
                        Out of stock
                      </div>
                    ) : null}
                    <ImageCarousel
                      images={p.imageUrls}
                      autoPlay={p.imageUrls.length > 1}
                      intervalMs={4000}
                      showIndicators={p.imageUrls.length > 1}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={p.name}
                    />
                  </div>
                  <div className="p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-200/70">
                      {p.categoryName}
                    </p>
                    <h3 className="mb-2 text-lg font-bold text-slate-50">{p.name}</h3>
                    <p className="text-xl font-bold text-indigo-400">
                      {formatPrice(p.priceCents)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
