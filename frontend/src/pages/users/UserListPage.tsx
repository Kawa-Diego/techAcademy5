import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { PaginatedResult, UserPublic } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PaginationControls } from '../../components/ui/PaginationControls';

export const UserListPage = (): ReactElement => {
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResult<UserPublic> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (token === null) return;
    try {
      const res = await httpJson<PaginatedResult<UserPublic>>(
        `/users?page=${String(page)}&pageSize=10`,
        { method: 'GET' },
        token
      );
      setData(res);
      setError(null);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to load users');
    }
  }, [token, page]);

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
        List refreshes automatically every 5 seconds.
      </p>
      <ErrorBanner message={error} />
      <div className="table-wrap">
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
