import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  isStrongPassword,
  isValidEmail,
  passwordHint,
} from '@ecommerce/shared';
import { ApiRequestError, httpJson } from '../services/http';
import { useScrollLock } from '../hooks/useScrollLock';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenRegister: () => void;
  /** Após login, navegar para este caminho (ex.: vitrine). Só caminhos relativos internos. */
  readonly returnTo?: string | null;
};

type Panel = 'login' | 'forgot';

export const LoginModal = ({
  isOpen,
  onClose,
  onOpenRegister,
  returnTo = null,
}: Props): React.ReactElement | null => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPanel('login');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setFieldError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useScrollLock(isOpen, mounted);

  useEffect(() => {
    const overlay = overlayRef.current;
    const panelEl = panelRef.current;
    if (!mounted || !overlay || !panelEl) return;

    if (!isOpen) {
      gsap
        .timeline({
          onComplete: () => setMounted(false),
        })
        .to(panelEl, { y: 24, opacity: 0, duration: 0.22, ease: 'power2.in' })
        .to(overlay, { opacity: 0, duration: 0.2 }, '<');
      return;
    }

    gsap.set(overlay, { opacity: 0 });
    gsap.set(panelEl, { y: 28, opacity: 0, scale: 0.96 });
    gsap
      .timeline()
      .to(overlay, { opacity: 1, duration: 0.25 })
      .to(
        panelEl,
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

  const close = (): void => {
    onClose();
  };

  const onSubmitLogin = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    setError(null);
    setFieldError(null);
    setSuccessMessage(null);
    if (!isValidEmail(email)) {
      setFieldError('E-mail inválido');
      return;
    }
    try {
      const res = await login({ email, password });
      close();
      const safeReturn =
        returnTo !== null &&
        returnTo !== '' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//')
          ? returnTo
          : null;
      if (safeReturn !== null) {
        navigate(safeReturn, { replace: true });
        return;
      }
      navigate(res.user.role === 'ADMIN' ? '/dashboard' : '/orders', {
        replace: true,
      });
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Não foi possível entrar.');
    }
  };

  const onSubmitForgot = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    setError(null);
    setFieldError(null);
    if (!isValidEmail(email)) {
      setFieldError('E-mail inválido');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setFieldError(passwordHint);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('As senhas não conferem');
      return;
    }
    try {
      await httpJson<undefined>(
        '/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), newPassword }),
        },
        null
      );
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Senha atualizada. Faça login com a nova senha.');
      setPanel('login');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Não foi possível atualizar a senha.');
    }
  };

  if (!mounted) return null;

  const titleId = panel === 'login' ? 'login-title' : 'forgot-title';

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
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl shadow-indigo-950/10"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
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
        {panel === 'login' ? (
          <>
            <h2
              id="login-title"
              className="mb-6 text-2xl font-bold tracking-tight text-slate-900"
            >
              Entrar
            </h2>
            {successMessage ? (
              <p className="ok-banner" role="status">
                {successMessage}
              </p>
            ) : null}
            {error ? (
              <p className="error-banner" role="alert">
                {error}
              </p>
            ) : null}
            <form className="flex flex-col gap-5" onSubmit={(e) => void onSubmitLogin(e)}>
              <div className="field">
                <label htmlFor="login-email">E-mail</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldError ? 'border-red-400' : ''}
                  aria-invalid={Boolean(fieldError)}
                  required
                />
                {fieldError ? (
                  <p className="field-error" role="alert">
                    {fieldError}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="login-password" className="m-0">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setFieldError(null);
                      setPanel('forgot');
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Criar conta
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2
              id="forgot-title"
              className="mb-2 text-2xl font-bold tracking-tight text-slate-900"
            >
              Redefinir senha
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              Informe o e-mail cadastrado e a nova senha. Você poderá entrar em seguida.
            </p>
            {error ? (
              <p className="error-banner" role="alert">
                {error}
              </p>
            ) : null}
            <form className="flex flex-col gap-5" onSubmit={(e) => void onSubmitForgot(e)}>
              <div className="field">
                <label htmlFor="forgot-email">E-mail</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldError ? 'border-red-400' : ''}
                  aria-invalid={Boolean(fieldError)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="forgot-new">Nova senha</label>
                <input
                  id="forgot-new"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="forgot-confirm">Confirmar nova senha</label>
                <input
                  id="forgot-confirm"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {fieldError ? (
                  <p className="field-error" role="alert">
                    {fieldError}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Atualizar senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setFieldError(null);
                    setPanel('login');
                  }}
                  className="text-center text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Voltar ao login
                </button>
              </div>
            </form>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
