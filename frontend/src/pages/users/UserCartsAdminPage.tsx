import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react';
import type { CartResponse, UserCartSummary } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

type CartsListBody = { readonly entries: readonly UserCartSummary[] };

const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'BRL',
  });

export const UserCartsAdminPage = (): ReactElement => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<readonly UserCartSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewCart, setViewCart] = useState<CartResponse | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [messageUserId, setMessageUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageBusy, setMessageBusy] = useState(false);
  const [messageOk, setMessageOk] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (token === null) return;
    try {
      const res = await httpJson<CartsListBody>(
        '/users/carts',
        { method: 'GET' },
        token
      );
      setEntries(res.entries);
      setError(null);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to load carts');
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const openView = async (userId: string): Promise<void> => {
    if (token === null) return;
    setViewUserId(userId);
    setViewCart(null);
    setViewLoading(true);
    try {
      const cart = await httpJson<CartResponse>(
        `/users/${userId}/cart`,
        { method: 'GET' },
        token
      );
      setViewCart(cart);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not load user cart');
      setViewUserId(null);
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = (): void => {
    setViewUserId(null);
    setViewCart(null);
  };

  const openMessage = (userId: string): void => {
    setMessageUserId(userId);
    setMessageText('');
    setMessageOk(null);
  };

  const closeMessage = (): void => {
    setMessageUserId(null);
    setMessageText('');
    setMessageOk(null);
  };

  const sendMessage = async (ev: FormEvent<HTMLFormElement>): Promise<void> => {
    ev.preventDefault();
    if (token === null || messageUserId === null) return;
    setMessageBusy(true);
    setMessageOk(null);
    try {
      await httpJson(
        `/users/${messageUserId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: messageText.trim() }),
        },
        token
      );
      setMessageOk('Message sent.');
      setMessageText('');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not send message');
    } finally {
      setMessageBusy(false);
    }
  };

  return (
    <div className="page">
      <h1 className="mb-6 text-2xl font-bold text-slate-50">Customer carts</h1>
      <p className="mb-4 text-sm text-slate-500">
        Users with at least one item in their cart. Send a short message that is stored for the customer (inbox UI can be added later).
      </p>
      <ErrorBanner message={error} />

      {entries.length === 0 ? (
        <p className="text-slate-400">No non-empty carts right now.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li
              key={e.userId}
              className="flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-zinc-950/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{e.userName}</p>
                <p className="text-sm text-slate-400">{e.userEmail}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {e.lineCount} line(s) · {e.itemQuantityTotal} item(s) total
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void openView(e.userId)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  View cart
                </button>
                <button
                  type="button"
                  onClick={() => openMessage(e.userId)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  Message
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewUserId !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="cart-view-title"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h2 id="cart-view-title" className="text-lg font-semibold text-white">
                Cart contents
              </h2>
              <button
                type="button"
                onClick={closeView}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
            {viewLoading ? (
              <p className="text-slate-500">Loading…</p>
            ) : viewCart === null || viewCart.items.length === 0 ? (
              <p className="text-slate-400">Cart is empty.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {viewCart.items.map((it) => (
                  <li
                    key={it.productId}
                    className="flex justify-between gap-2 border-b border-white/10 pb-2"
                  >
                    <span className="text-slate-200">{it.productName}</span>
                    <span className="shrink-0 text-slate-400">
                      ×{it.quantity} · {formatMoney(it.priceCents * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {messageUserId !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="msg-title"
        >
          <form
            onSubmit={(e) => void sendMessage(e)}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-xl"
          >
            <h2 id="msg-title" className="mb-3 text-lg font-semibold text-white">
              Message to user
            </h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              required
              maxLength={5000}
              className="mb-3 w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-slate-100 placeholder:text-slate-500"
              placeholder="Write your message…"
            />
            {messageOk !== null ? (
              <p className="mb-2 text-sm text-emerald-400">{messageOk}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={messageBusy}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {messageBusy ? 'Sending…' : 'Send'}
              </button>
              <button
                type="button"
                onClick={closeMessage}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};
