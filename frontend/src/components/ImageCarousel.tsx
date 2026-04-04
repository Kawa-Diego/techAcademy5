import { useEffect, useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { mediaUrl } from '../services/http';

type Props = {
  readonly images: readonly string[];
  readonly autoPlay?: boolean;
  readonly intervalMs?: number;
  readonly showControls?: boolean;
  /** Indicadores em pontos (sem setas), útil em grades de produto */
  readonly showIndicators?: boolean;
  readonly className?: string;
  readonly imgClassName?: string;
  readonly alt?: string;
};

export const ImageCarousel = ({
  images,
  autoPlay = false,
  intervalMs = 4000,
  showControls = false,
  showIndicators = false,
  className = '',
  imgClassName = 'h-full w-full object-cover',
  alt = '',
}: Props): ReactElement => {
  const list = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  useEffect(() => {
    if (!autoPlay || list.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [autoPlay, intervalMs, list.length]);

  const src = list[index] ?? list[0];

  useLayoutEffect(() => {
    const el = imgRef.current;
    if (el === null || list.length === 0) return;
    gsap.fromTo(
      el,
      { opacity: 0.15, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, [index, src, list.length]);

  if (list.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-slate-500 ${className}`}
      >
        Sem imagem
      </div>
    );
  }

  const next = (): void => setIndex((i) => (i + 1) % list.length);
  const prev = (): void =>
    setIndex((i) => (i - 1 + list.length) % list.length);

  const showDots = (showControls || showIndicators) && list.length > 1;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={mediaUrl(src)}
        alt={alt}
        className={imgClassName}
      />
      {showControls && list.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}
      {showDots ? (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {list.map((_, i) => (
            <button
              key={String(i)}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? 'bg-amber-300 shadow-sm' : 'bg-white/45 hover:bg-white/70'
              }`}
              aria-label={`Imagem ${String(i + 1)}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
