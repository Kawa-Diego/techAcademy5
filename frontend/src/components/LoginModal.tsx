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
  /** E-mail preenchido (ex.: após cadastro). */
  readonly prefilledEmail?: string | null;
};

type Panel = 'login' | 'forgot';

export const LoginModal = ({
  isOpen,
  onClose,
  onOpenRegister,
  returnTo = null,
  prefilledEmail = null,
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

  useEffect(() => {
    if (!isOpen || prefilledEmail === null || prefilledEmail.length === 0) return;
    setEmail(prefilledEmail);
    setPanel('login');
  }, [isOpen, prefilledEmail]);

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
      setFieldError('Invalid email');
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
      else setError('Could not sign in.');
    }
  };

  const onSubmitForgot = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    setError(null);
    setFieldError(null);
    if (!isValidEmail(email)) {
      setFieldError('Invalid email');
      return;
    }
    if (!isStrongPassword(newPassword)) {
      setFieldError(passwordHint);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError('Passwords do not match');
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
      setSuccessMessage('Password updated. Sign in with your new password.');
      setPanel('login');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not update password.');
    }
  };

  if (!mounted) return null;

  const titleId = panel === 'login' ? 'login-title' : 'forgot-title';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-slate-950/70 p-4 backdrop-blur-md"
      role="presentation"
      onClick={close}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          ref={panelRef}
          className="auth-modal relative w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {panel === 'login' ? (
          <>
            <h2
              id="login-title"
              className="mb-6 text-2xl font-bold tracking-tight text-slate-50"
            >
              Sign in
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
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={
                    fieldError
                      ? '!border-red-400 ring-1 ring-red-400/40'
                      : ''
                  }
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
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setFieldError(null);
                      setPanel('forgot');
                    }}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
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
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-center text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Create account
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2
              id="forgot-title"
              className="mb-2 text-2xl font-bold tracking-tight text-slate-50"
            >
              Reset password
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              Enter your registered email and new password. You can sign in right after.
            </p>
            {error ? (
              <p className="error-banner" role="alert">
                {error}
              </p>
            ) : null}
            <form className="flex flex-col gap-5" onSubmit={(e) => void onSubmitForgot(e)}>
              <div className="field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={
                    fieldError
                      ? '!border-red-400 ring-1 ring-red-400/40'
                      : ''
                  }
                  aria-invalid={Boolean(fieldError)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="forgot-new">New password</label>
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
                <label htmlFor="forgot-confirm">Confirm new password</label>
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
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-[0.98]"
                >
                  Update password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setFieldError(null);
                    setPanel('login');
                  }}
                  className="text-center text-sm font-medium text-slate-400 hover:text-slate-200"
                >
                  Back to sign in
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
