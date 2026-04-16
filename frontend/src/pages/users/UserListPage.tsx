import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react';
import { Link } from 'react-router-dom';
import type { PaginatedResult, UserPublic } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PaginationControls } from '../../components/ui/PaginationControls';

export const UserListPage = (): ReactElement => {
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<PaginatedResult<UserPublic> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async (): Promise<void> => {
    if (token === null) return;
    try {
      const q =
        debouncedSearch.length > 0
          ? `&q=${encodeURIComponent(debouncedSearch)}`
          : '';
      const res = await httpJson<PaginatedResult<UserPublic>>(
        `/users?page=${String(page)}&pageSize=10${q}`,
        { method: 'GET' },
        token
      );
      setData(res);
      setError(null);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to load users');
    }
  }, [token, page, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      void load();
    }, 5000);
    return () => clearInterval(id);
  }, [load]);

  const onDelete = async (id: string, email: string): Promise<void> => {
    if (token === null) return;
    if (id === user?.id) {
      window.alert('Use “Delete my account” in your profile to remove your own account.');
      return;
    }
    if (!window.confirm(`Permanently remove account ${email}?`)) return;
    setDeletingId(id);
    try {
      await httpJson<undefined>(`/users/${id}`, { method: 'DELETE' }, token);
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) window.alert(e.message);
      else window.alert('Could not delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (data === null && error === null) {
    return (
      <div className="page text-slate-500">Loading users…</div>
    );
  }

  const meta = data?.meta;

  return (
    <div className="page">
      <h1 className="mb-6 text-2xl font-bold text-slate-50">Users</h1>
      <p className="mb-4 text-sm text-slate-500">
        List refreshes automatically every 5 seconds. Use search to filter by name or email.
      </p>
      <div className="mb-4">
        <label htmlFor="user-search" className="mb-1 block text-sm font-medium text-slate-300">
          Search users
        </label>
        <input
          id="user-search"
          type="search"
          value={searchInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchInput(e.target.value);
          }}
          placeholder="Type name or email…"
          className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          autoComplete="off"
        />
      </div>
      <ErrorBanner message={error} />

      <div className="space-y-3 md:hidden">
        {data?.data.map((u) => (
          <article
            key={u.id}
            className="rounded-xl border border-amber-500/25 bg-zinc-950/55 p-4 shadow-sm"
          >
            <p className="font-semibold text-white">{u.name}</p>
            <p className="mt-1 break-all text-sm text-slate-400">{u.email}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-amber-200/80">
              {u.role}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 border-t border-white/10 pt-3">
              {u.id !== user?.id ? (
                <>
                  <Link
                    to={`/users/${u.id}/edit`}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="link-btn text-sm"
                    disabled={deletingId === u.id}
                    onClick={() => void onDelete(u.id, u.email)}
                  >
                    {deletingId === u.id ? 'Removing…' : 'Delete'}
                  </button>
                </>
              ) : (
                <span className="text-sm text-slate-500">Your account</span>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.id !== user?.id ? (
                    <span className="row-actions">
                      <Link to={`/users/${u.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        className="link-btn"
                        disabled={deletingId === u.id}
                        onClick={() => void onDelete(u.id, u.email)}
                      >
                        {deletingId === u.id ? 'Removing…' : 'Delete'}
                      </button>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta !== undefined ? (
        <PaginationControls
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
};
