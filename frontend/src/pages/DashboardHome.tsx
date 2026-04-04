import { useEffect, useRef, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

const linkClass =
  'dash-card block rounded-xl border border-amber-500/35 bg-zinc-950/60 px-6 py-5 font-medium text-slate-100 shadow-md shadow-black/20 transition hover:border-amber-400/50 hover:bg-zinc-900/80 hover:text-indigo-300 hover:shadow-lg';

export const DashboardHome = (): ReactElement => {
  const { user } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    const cards = root.querySelectorAll('.dash-card');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { y: 28, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          stagger: 0.09,
          ease: 'power2.out',
          delay: 0.08,
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="page max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-50">
        Olá, {user?.name}
      </h1>
      <p className="mb-10 text-slate-400">
        Área logada. Escolha um módulo ou gerencie seu perfil.
      </p>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
        <li>
          <Link to="/users" className={linkClass}>
            Usuários
          </Link>
        </li>
        <li>
          <Link to="/categories" className={linkClass}>
            Categorias
          </Link>
        </li>
        <li>
          <Link to="/products" className={linkClass}>
            Produtos
          </Link>
        </li>
        <li>
          <Link to="/orders" className={linkClass}>
            Pedidos
          </Link>
        </li>
        <li>
          <Link to="/profile/edit" className={linkClass}>
            Editar perfil
          </Link>
        </li>
      </ul>
    </div>
  );
};
