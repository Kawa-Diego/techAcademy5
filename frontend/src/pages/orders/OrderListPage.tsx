import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { Order, PaginatedResult } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { PaginationControls } from '../../components/ui/PaginationControls';

const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'BRL',
  });

export const OrderListPage = (): ReactElement => {
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [list, setList] = useState<PaginatedResult<Order> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (token === null) return;
    setError(null);
    try {
      const res = await httpJson<PaginatedResult<Order>>(
        `/orders?page=${String(page)}&pageSize=10`,
        { method: 'GET' },
        token
      );
      setList(res);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to load orders');
    }
  }, [token, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const requestRefund = async (
    orderId: string,
    itemId: string
  ): Promise<void> => {
    if (token === null) return;
    const key = `${orderId}-${itemId}-req`;
    setBusyKey(key);
    setError(null);
    try {
      await httpJson<Order>(
        `/orders/${orderId}/items/${itemId}/refund-request`,
        {
          method: 'POST',
          body: JSON.stringify({ confirm: true }),
        },
        token
      );
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not request refund');
    } finally {
      setBusyKey(null);
    }
  };

  const confirmRefund = async (
    orderId: string,
    itemId: string
  ): Promise<void> => {
    if (token === null) return;
    const key = `${orderId}-${itemId}-conf`;
    setBusyKey(key);
    setError(null);
    try {
      await httpJson<Order>(
        `/orders/${orderId}/items/${itemId}/refund-confirm`,
        { method: 'POST' },
        token
      );
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not confirm refund');
    } finally {
      setBusyKey(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const orders = list?.data ?? [];
  const meta = list?.meta;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
      </div>
      <ErrorBanner message={error} />
      {list === null && error === null ? (
        <p className="text-slate-400">Loading…</p>
      ) : null}
      {orders.length === 0 && list !== null ? (
        <p className="text-slate-400">No orders to show.</p>
      ) : null}
      <div className="flex flex-col gap-6">
        {orders.map((o) => (
          <section
            key={o.id}
            className="admin-form-panel text-left"
          >
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Order{' '}
                  <span className="font-mono text-amber-200/90">{o.id.slice(0, 8)}…</span>
                </h2>
                <p className="text-sm text-slate-400">
                  {new Date(o.createdAt).toLocaleString('en-US')} ·{' '}
                  <span className="text-slate-300">{o.status}</span>
                </p>
              </div>
              {isAdmin && (o.userEmail !== null || o.userName !== null) ? (
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">{o.userName}</span>
                  {o.userEmail ? (
                    <span className="text-slate-400"> · {o.userEmail}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
            {o.notes.trim().length > 0 ? (
              <p className="mb-3 text-sm text-slate-400">Notes: {o.notes}</p>
            ) : null}
            <ul className="space-y-4">
              {o.items.map((it) => {
                const refundPending =
                  it.refundRequestedAt !== null && it.refundConfirmedAt === null;
                const refunded = it.refundConfirmedAt !== null;
                return (
                  <li
                    key={it.id}
                    className="rounded-lg border border-white/10 bg-zinc-950/40 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {it.productName ?? 'Product'}{' '}
                          <span className="font-mono text-sm text-slate-500">
                            ({it.productId.slice(0, 8)}…)
                          </span>
                        </p>
                        <p className="text-sm text-slate-300">
                          {it.quantity} × {formatMoney(it.unitPriceCents)}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        {refunded ? (
                          <span className="text-emerald-400">Refund confirmed</span>
                        ) : refundPending ? (
                          <span className="text-amber-300">Refund requested</span>
                        ) : !isAdmin ? (
                          <RefundRequestBlock
                            busy={busyKey === `${o.id}-${it.id}-req`}
                            onConfirm={() => void requestRefund(o.id, it.id)}
                          />
                        ) : null}
                        {isAdmin && refundPending ? (
                          <button
                            type="button"
                            disabled={busyKey === `${o.id}-${it.id}-conf`}
                            onClick={() => void confirmRefund(o.id, it.id)}
                            className="mt-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            Confirm refund
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {isAdmin ? (
              <div className="mt-4 border-t border-white/10 pt-3">
                <Link
                  to={`/orders/${o.id}/edit`}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Edit order
                </Link>
              </div>
            ) : null}
          </section>
        ))}
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

const RefundRequestBlock = ({
  busy,
  onConfirm,
}: {
  readonly busy: boolean;
  readonly onConfirm: () => void;
}): ReactElement => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col items-end gap-2">
      <label className="flex cursor-pointer items-center gap-2 text-slate-300">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="rounded border-slate-500"
        />
        I confirm the refund request
      </label>
      <button
        type="button"
        disabled={!checked || busy}
        onClick={onConfirm}
        className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:bg-amber-900/50 disabled:opacity-40"
      >
        {busy ? 'Sending…' : 'Request refund'}
      </button>
    </div>
  );
};
