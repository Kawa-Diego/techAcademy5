import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category, PaginatedResult } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { DataTable, type TableColumn } from '../../components/ui/DataTable';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const CategoryListPage = (): React.ReactElement => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResult<Category> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (token === null) return;
    setError(null);
    try {
      const res = await httpJson<PaginatedResult<Category>>(
        `/categories?page=${String(page)}&pageSize=10`,
        { method: 'GET' },
        token
      );
      setData(res);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Falha ao listar');
    }
  }, [token, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (cid: string) => {
    if (token === null) return;
    if (!window.confirm('Excluir categoria?')) return;
    try {
      await httpJson<void>(`/categories/${cid}`, { method: 'DELETE' }, token);
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Erro ao excluir');
    }
  };

  const columns: TableColumn<Category>[] = [
    { header: 'Nome', render: (r) => r.name },
    { header: 'Descrição', render: (r) => r.description },
    ...(isAdmin
      ? [
          {
            header: 'Ações',
            render: (r: Category) => (
              <span className="row-actions">
                <Link to={`/categories/${r.id}/edit`}>Editar</Link>
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => void remove(r.id)}
                >
                  Excluir
                </button>
              </span>
            ),
          } satisfies TableColumn<Category>,
        ]
      : []),
  ];

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Categorias</h1>
        {isAdmin ? (
          <Link to="/categories/new" className="btn btn-primary">
            Nova categoria
          </Link>
        ) : null}
      </div>
      <ErrorBanner message={error} />
      <DataTable columns={columns} rows={rows} />
      {meta ? (
        <PaginationControls
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
};
