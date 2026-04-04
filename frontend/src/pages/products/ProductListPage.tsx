import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCents, type PaginatedResult, type Product } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError, mediaUrl } from '../../services/http';
import { DataTable, type TableColumn } from '../../components/ui/DataTable';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const ProductListPage = (): React.ReactElement => {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResult<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (token === null) return;
    setError(null);
    try {
      const res = await httpJson<PaginatedResult<Product>>(
        `/products?page=${String(page)}&pageSize=10`,
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

  const remove = async (id: string) => {
    if (token === null) return;
    if (!window.confirm('Excluir produto?')) return;
    try {
      await httpJson<void>(`/products/${id}`, { method: 'DELETE' }, token);
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Erro ao excluir');
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      header: '',
      render: (r) =>
        r.imageUrls.length > 0 ? (
          <img
            src={mediaUrl(r.imageUrls[0])}
            alt=""
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    { header: 'Nome', render: (r) => r.name },
    { header: 'Preço', render: (r) => formatCents(r.priceCents) },
    { header: 'Categoria (id)', render: (r) => r.categoryId },
    {
      header: 'Ações',
      render: (r: Product) => (
        <span className="row-actions">
          <Link to={`/products/${r.id}/edit`}>Editar</Link>
          <button
            type="button"
            className="link-btn"
            onClick={() => void remove(r.id)}
          >
            Excluir
          </button>
        </span>
      ),
    },
  ];

  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Produtos 3D</h1>
        <Link to="/products/new" className="btn btn-primary">
          Novo produto
        </Link>
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
