import { useEffect, useState, type FormEvent, type ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PublicProduct } from '@ecommerce/shared';
import { ImageCarousel } from '../../components/ImageCarousel';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';

const formatPrice = (cents: number): string =>
  (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const ProductPublicDetailPage = (): ReactElement => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (productId === undefined) return;
    void (async (): Promise<void> => {
      try {
        const p = await httpJson<PublicProduct>(
          `/public/products/${productId}`,
          { method: 'GET' },
          null
        );
        setProduct(p);
        setError(null);
      } catch (e) {
        if (e instanceof ApiRequestError) setError(e.message);
        else setError('Produto não encontrado');
        setProduct(null);
      }
    })();
  }, [productId]);

  const onSubmitOrder = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    if (product === null || token === null || user?.role !== 'USER') return;
    if (product.outOfStock) return;
    setOrderError(null);
    setBusy(true);
    try {
      await httpJson(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            items: [{ productId: product.id, quantity: 1 }],
            notes: '',
          }),
        },
        token
      );
      navigate('/orders');
    } catch (e) {
      if (e instanceof ApiRequestError) setOrderError(e.message);
      else setOrderError('Não foi possível concluir o pedido');
    } finally {
      setBusy(false);
    }
  };

  if (error !== null && product === null) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
        <p className="error-banner">{error}</p>
        <Link to="/vitrine" className="mt-4 inline-block text-indigo-600">
          ← Voltar à vitrine
        </Link>
      </main>
    );
  }

  if (product === null) {
    return (
      <main className="px-6 pt-28 text-center text-slate-500">Carregando…</main>
    );
  }

  const loginNext = encodeURIComponent(`/vitrine/${product.id}`);
  const isCustomer = user?.role === 'USER';
  const showBuy = isCustomer && !product.outOfStock;

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-28 lg:pt-36">
      <Link
        to="/vitrine"
        className="mb-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ← Voltar à vitrine
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {product.outOfStock ? (
            <div className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
              Fora de estoque
            </div>
          ) : null}
          <div className="aspect-square">
            <ImageCarousel
              images={product.imageUrls}
              autoPlay={false}
              showControls
              className="h-full w-full"
              imgClassName="h-full w-full object-contain bg-slate-50"
              alt={product.name}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium uppercase text-slate-500">
            {product.categoryName}
          </p>
          <h1 className="mb-4 text-3xl font-bold text-slate-900">
            {product.name}
          </h1>
          <p className="mb-6 text-3xl font-bold text-indigo-600">
            {formatPrice(product.priceCents)}
          </p>
          <p className="mb-8 leading-relaxed text-slate-600">{product.description}</p>

          {product.outOfStock ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              Este produto está indisponível para compra no momento.
            </p>
          ) : user?.role === 'ADMIN' ? (
            <p className="text-sm text-slate-500">
              Para registrar pedidos como administrador, use{' '}
              <Link to="/orders/new" className="font-medium text-indigo-600 underline">
                Pedidos → Novo pedido
              </Link>
              .
            </p>
          ) : token === null ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm text-slate-700">
                Entre com sua conta de cliente para efetuar o pedido.
              </p>
              <Link
                to={`/?login=1&next=${loginNext}`}
                className="inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Entrar e comprar
              </Link>
            </div>
          ) : showBuy ? (
            <form onSubmit={(e) => void onSubmitOrder(e)} className="space-y-3">
              {orderError !== null ? (
                <p className="text-sm text-red-600" role="alert">
                  {orderError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-60 sm:w-auto"
              >
                {busy ? 'Processando…' : 'Comprar agora (1 unidade)'}
              </button>
              <p className="text-xs text-slate-500">
                O pedido será criado como pendente. Você pode acompanhar em Pedidos.
              </p>
            </form>
          ) : (
            <p className="text-sm text-slate-500">
              Apenas contas de cliente podem comprar pela vitrine.
            </p>
          )}
        </div>
      </div>
    </main>
  );
};
