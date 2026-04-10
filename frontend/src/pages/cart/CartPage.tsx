import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { CartResponse, Order } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpJson } from '../../services/http';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Button } from '../../components/ui/Button';

const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'BRL',
  });

export const CartPage = (): ReactElement => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (token === null) return;
    try {
      const res = await httpJson<CartResponse>('/cart', { method: 'GET' }, token);
      setCart(res);
      setError(null);
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not load cart');
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const setQty = async (productId: string, quantity: number): Promise<void> => {
    if (token === null) return;
    const key = productId;
    setBusyKey(key);
    setError(null);
    try {
      await httpJson<CartResponse>(
        '/cart/items',
        {
          method: 'POST',
          body: JSON.stringify({ productId, quantity }),
        },
        token
      );
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not update cart');
    } finally {
      setBusyKey(null);
    }
  };

  const removeLine = async (productId: string): Promise<void> => {
    if (token === null) return;
    setBusyKey(productId);
    setError(null);
    try {
      await httpJson<CartResponse>(
        `/cart/items/${productId}`,
        { method: 'DELETE' },
        token
      );
      await load();
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Could not remove item');
    } finally {
      setBusyKey(null);
    }
  };

  const checkout = async (): Promise<void> => {
    if (token === null) return;
    setCheckoutBusy(true);
    setError(null);
    try {
      await httpJson<Order>(
        '/cart/checkout',
        {
          method: 'POST',
          body: JSON.stringify({ notes: '' }),
        },
        token
      );
      await load();
      navigate('/orders');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Checkout failed');
    } finally {
      setCheckoutBusy(false);
    }
  };

  if (user?.role !== 'USER') {
    return (
      <div className="page">
        <h1>Cart</h1>
        <p className="text-slate-400">Only customer accounts use the cart.</p>
        <Link to="/dashboard" className="text-indigo-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (cart === null) {
    return (
      <div className="page text-slate-500">Loading cart…</div>
    );
  }

  const subtotalCents = cart.items.reduce(
    (s, i) => s + i.priceCents * i.quantity,
    0
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Cart</h1>
        <Link to="/vitrine" className="text-sm text-indigo-400 hover:text-indigo-300">
          Continue shopping
        </Link>
      </div>
      <ErrorBanner message={error} />

      {cart.items.length === 0 ? (
        <p className="text-slate-400">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {cart.items.map((it) => (
              <li
                key={it.productId}
                className="order-item-row flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{it.productName}</p>
                  <p className="text-sm text-slate-400">
                    {formatMoney(it.priceCents)} each · max {it.stockQuantity} in stock
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busyKey === it.productId || it.quantity <= 1}
                    onClick={() => void setQty(it.productId, it.quantity - 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center font-mono text-slate-100">
                    {it.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={
                      busyKey === it.productId || it.quantity >= it.stockQuantity
                    }
                    onClick={() => void setQty(it.productId, it.quantity + 1)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    disabled={busyKey === it.productId}
                    onClick={() => void removeLine(it.productId)}
                    className="ml-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-right font-medium text-amber-100 sm:min-w-[6rem]">
                  {formatMoney(it.priceCents * it.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-slate-200">
              Subtotal{' '}
              <span className="font-semibold text-white">{formatMoney(subtotalCents)}</span>
            </p>
            <Button
              type="button"
              disabled={checkoutBusy}
              onClick={() => void checkout()}
            >
              {checkoutBusy ? 'Placing order…' : 'Place order'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
