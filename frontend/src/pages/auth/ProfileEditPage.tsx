import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  cpfDigitsOnly,
  formatCpfMasked,
  formatDisplayName,
  passwordHint,
} from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { ApiRequestError } from '../../services/http';
import { collectProfileUpdateErrors } from '../../validation/profileForm';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0];
  const b = parts[parts.length - 1][0];
  return `${a}${b}`.toUpperCase();
}

function formatJoinedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const sectionCard =
  'rounded-xl border border-amber-500/35 bg-zinc-950/55 p-6 sm:p-8';

export const ProfileEditPage = (): React.ReactElement => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [cpf, setCpf] = useState(user?.cpf ?? '');

  useEffect(() => {
    if (user !== null) {
      setName(user.name);
      setCpf(formatCpfMasked(user.cpf));
    }
  }, [user]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);

  const email = user?.email ?? '';
  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : 'Customer';
  const roleStyles =
    user?.role === 'ADMIN'
      ? 'bg-indigo-500/25 text-indigo-200 ring-1 ring-inset ring-indigo-400/35'
      : 'bg-slate-500/20 text-slate-200 ring-1 ring-inset ring-slate-400/25';

  const avatarInitials = useMemo(
    () => (user ? initialsFromName(user.name) : ''),
    [user]
  );

  if (user === null) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-1">
        <div className="rounded-2xl border-2 border-amber-500/35 bg-zinc-900/50 p-2">
          <div className="h-36 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900" />
          <div className="-mt-12 flex justify-center">
            <div className="h-28 w-28 rounded-2xl border-4 border-zinc-900 bg-slate-700 shadow-lg" />
          </div>
          <div className="mx-auto mt-8 h-8 max-w-xs rounded-lg bg-zinc-800" />
          <div className="mx-auto mt-3 h-4 max-w-sm rounded bg-zinc-800/70" />
          <p className="mt-8 pb-6 text-center text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setError(null);
    setOk(null);
    const msgs = collectProfileUpdateErrors({ name, cpf, password, confirm });
    if (msgs.length > 0) {
      setClientErrors(msgs);
      return;
    }
    setClientErrors([]);
    try {
      await updateProfile({
        name: formatDisplayName(name),
        password,
        cpf: cpfDigitsOnly(cpf),
      });
      setOk('Changes saved successfully.');
      setPassword('');
      setConfirm('');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not save');
    }
  };

  return (
    <div className="profile-panel mx-auto max-w-3xl px-1 pb-12">
      <div className="overflow-hidden rounded-2xl border-2 border-amber-500/45 bg-zinc-900/45 shadow-[0_0_32px_-8px_rgba(245,158,11,0.2)]">
        {/* Faixa superior: identidade (fundo contínuo no painel) */}
        <div className="relative bg-gradient-to-br from-indigo-600/95 via-indigo-500/95 to-violet-700/95 px-6 pb-24 pt-10 sm:px-10 sm:pb-28 sm:pt-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-violet-400/25 blur-xl"
            aria-hidden
          />
          <p className="relative text-sm font-medium text-indigo-100">Your account</p>
          <h1 className="relative mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Profile</h1>
          <p className="relative mt-2 max-w-lg text-sm text-indigo-100/90">
            Update your details and keep your password fresh for a more secure account.
          </p>
        </div>

        <div className="relative -mt-16 px-5 sm:px-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-4 border-zinc-900 bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-bold text-white shadow-xl ring-2 ring-amber-500/40"
              aria-hidden
            >
              {avatarInitials}
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:mb-1 sm:flex-1 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold text-slate-50">{user.name}</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleStyles}`}
                >
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{email}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Member since {formatJoinedAt(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-5 pb-6 pt-8 sm:px-8">
          <ErrorBanner message={error} />
          {ok ? (
            <div
              className="flex items-start gap-3 rounded-xl border border-emerald-500/35 bg-emerald-950/40 px-4 py-3 text-emerald-100"
              role="status"
            >
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                aria-hidden
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-emerald-100">All set</p>
                <p className="text-sm text-emerald-200/90">{ok}</p>
              </div>
            </div>
          ) : null}
          {clientErrors.length > 0 ? (
            <ul className="list-none rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {clientErrors.map((m) => (
                <li key={m} className="flex gap-2 py-0.5">
                  <span className="text-red-400/80" aria-hidden>
                    •
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          ) : null}

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-8">
            <div className={sectionCard}>
              <div className="mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-50">Personal details</h3>
                  <p className="text-sm text-slate-400">Name and ID used in the store</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextField
                    label="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setName((n) => formatDisplayName(n))}
                    autoComplete="name"
                    required
                  />
                </div>
                <TextField label="Email" value={email} disabled readOnly className="opacity-90" />
                <TextField
                  label="CPF"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpfMasked(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                  autoComplete="off"
                  required
                />
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Email cannot be changed here. For changes, contact support.
              </p>
            </div>

            <div className={sectionCard}>
              <div className="mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-slate-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-50">Security</h3>
                  <p className="text-sm text-slate-400">New password to confirm your changes</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <TextField
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <p className="mt-4 text-xs text-slate-500">{passwordHint}</p>
            </div>

            <FormActions>
              <Button
                type="submit"
                className="min-w-[140px] px-6 py-2.5 text-base font-semibold shadow-md shadow-indigo-500/25"
              >
                Save changes
              </Button>
            </FormActions>
          </form>
        </div>

        {/* Rodapé do painel: mesmo estilo das listagens (borda dourada, conteúdo centralizado) */}
        <div className="border-t-2 border-amber-500/40 bg-zinc-950/60 px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </span>
            <h3 className="text-lg font-semibold text-slate-50">Danger zone</h3>
            <p className="mt-2 text-sm text-slate-400">
              Deleting your account removes your data from the system. This cannot be undone.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl border-2 border-amber-500/40 bg-zinc-900/80 px-6 py-2.5 text-sm font-semibold text-red-300 transition hover:border-amber-400/50 hover:bg-red-950/30 hover:text-red-200"
              onClick={() => {
                if (!window.confirm('Are you sure? Your account will be permanently deleted.')) {
                  return;
                }
                void (async () => {
                  try {
                    await deleteAccount();
                    navigate('/');
                  } catch (e) {
                    if (e instanceof ApiRequestError) setError(e.message);
                    else setError('Could not delete account');
                  }
                })();
              }}
            >
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
