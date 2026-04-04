import { type FormEvent, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import {
  cpfDigitsOnly,
  formatCpfMasked,
  formatDisplayName,
  isStrongPassword,
  isValidCpf,
  isValidEmail,
  passwordHint,
} from '@ecommerce/shared';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../services/http';
import { useScrollLock } from '../hooks/useScrollLock';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenLogin: () => void;
};

export const RegisterModal = ({
  isOpen,
  onClose,
  onOpenLogin,
}: Props): React.ReactElement | null => {
  const { register } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useScrollLock(isOpen, mounted);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!mounted || !overlay || !panel) return;

    if (!isOpen) {
      gsap
        .timeline({
          onComplete: () => setMounted(false),
        })
        .to(panel, { y: 24, opacity: 0, duration: 0.22, ease: 'power2.in' })
        .to(overlay, { opacity: 0, duration: 0.2 }, '<');
      return;
    }

    gsap.set(overlay, { opacity: 0 });
    gsap.set(panel, { y: 28, opacity: 0, scale: 0.96 });
    gsap
      .timeline()
      .to(overlay, { opacity: 1, duration: 0.25 })
      .to(
        panel,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power3.out',
        },
        '-0.05'
      );
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setCpf('');
      setPassword('');
      setConfirm('');
      setError(null);
      setClientErrors([]);
    }
  }, [isOpen]);

  const close = (): void => {
    onClose();
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    setError(null);
    const msgs: string[] = [];
    if (!isValidEmail(email)) msgs.push('E-mail inválido');
    if (!isValidCpf(cpf)) msgs.push('CPF inválido');
    if (!isStrongPassword(password)) msgs.push(passwordHint);
    if (password !== confirm) msgs.push('Senhas não conferem');
    if (msgs.length > 0) {
      setClientErrors(msgs);
      return;
    }
    setClientErrors([]);
    try {
      await register({
        name: formatDisplayName(name),
        email,
        password,
        cpf: cpfDigitsOnly(cpf),
      });
      close();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Falha no cadastro');
    }
  };

  if (!mounted) return null;

  const inputClass =
    'rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-slate-900/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={close}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          ref={panelRef}
          className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl shadow-indigo-950/10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <h2
          id="register-title"
          className="mb-6 text-2xl font-bold tracking-tight text-slate-900"
        >
          Criar conta
        </h2>
        {error ? (
          <p className="error-banner" role="alert">
            {error}
          </p>
        ) : null}
        {clientErrors.length > 0 ? (
          <ul className="error-list mb-4" role="alert">
            {clientErrors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : null}
        <form className="flex flex-col gap-4" onSubmit={(e) => void onSubmit(e)}>
          <div className="field">
            <label htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setName((n) => formatDisplayName(n))}
              className={inputClass}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-cpf">CPF</label>
            <input
              id="register-cpf"
              name="cpf"
              autoComplete="off"
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(e) => setCpf(formatCpfMasked(e.target.value))}
              className={inputClass}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-confirm">Confirmar senha</label>
            <input
              id="register-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              Cadastrar
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Já tenho conta
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
