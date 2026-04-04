import { type FormEvent, useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  cpfDigitsOnly,
  formatCpfMasked,
  formatDisplayName,
  type UpdateUserPayload,
  type UserPublic,
} from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { collectProfileUpdateErrors } from '../../validation/profileForm';

export const UserEditPage = (): ReactElement => {
  const { id } = useParams();
  const { token, user: me } = useAuth();
  const navigate = useNavigate();
  const [target, setTarget] = useState<UserPublic | null>(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined || token === null) return;
    if (me?.id === id) {
      navigate('/profile/edit', { replace: true });
      return;
    }
    void (async (): Promise<void> => {
      setLoadError(null);
      try {
        const row = await httpJson<UserPublic>(`/users/${id}`, { method: 'GET' }, token);
        setTarget(row);
        setName(row.name);
        setCpf(formatCpfMasked(row.cpf));
      } catch (e) {
        if (e instanceof ApiRequestError) setLoadError(e.message);
        else setLoadError('Não foi possível carregar o usuário');
        setTarget(null);
      }
    })();
  }, [id, token, me?.id, navigate]);

  const email = target?.email ?? '';

  const onSubmit = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    if (token === null || id === undefined) return;
    setError(null);
    setOk(null);
    const msgs = collectProfileUpdateErrors({ name, cpf, password, confirm });
    if (msgs.length > 0) {
      setClientErrors(msgs);
      return;
    }
    setClientErrors([]);
    const body: UpdateUserPayload = {
      name: formatDisplayName(name),
      password,
      cpf: cpfDigitsOnly(cpf),
    };
    try {
      const next = await httpJson<UserPublic>(
        `/users/${id}`,
        { method: 'PUT', body: JSON.stringify(body) },
        token
      );
      setTarget(next);
      setOk('Usuário atualizado.');
      setPassword('');
      setConfirm('');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Não foi possível salvar');
    }
  };

  if (loadError !== null && target === null) {
    return (
      <div className="page">
        <ErrorBanner message={loadError} />
        <Link to="/users" className="text-indigo-400 hover:text-indigo-300">
          ← Voltar à lista
        </Link>
      </div>
    );
  }

  if (target === null) {
    return <div className="page text-slate-500">Carregando…</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Editar usuário</h1>
        <Link to="/users" className="btn btn-secondary">
          Voltar à lista
        </Link>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        E-mail: <span className="text-slate-300">{email}</span> (somente leitura no sistema)
      </p>
      <ErrorBanner message={error} />
      {ok ? (
        <p className="ok-banner mb-4" role="status">
          {ok}
        </p>
      ) : null}
      {clientErrors.length > 0 ? (
        <ul className="error-list mb-4" role="alert">
          {clientErrors.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : null}
      <div className="admin-form-panel">
        <form onSubmit={(e) => void onSubmit(e)} className="stack narrow max-w-xl">
          <TextField
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setName((n) => formatDisplayName(n))}
            autoComplete="name"
            required
          />
          <TextField label="E-mail" value={email} disabled readOnly />
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
          <TextField
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmar senha"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <FormActions>
            <Button type="submit">Salvar</Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
};
