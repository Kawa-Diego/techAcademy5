import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  Order,
  OrderStatus,
  PaginatedResult,
  Product,
} from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { SelectField } from '../../components/ui/SelectField';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { Button } from '../../components/ui/Button';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import {
  OrderItemsEditor,
  type OrderItemDraft,
} from './OrderItemsEditor';

const STATUSES: readonly OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'CANCELLED',
] as const;

export const OrderNewPage = (): React.ReactElement => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([
    { productId: '', quantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (token === null) return;
      try {
        const res = await httpJson<PaginatedResult<Product>>(
          '/products?page=1&pageSize=100',
          { method: 'GET' },
          token
        );
        setProducts([...res.data]);
      } catch {
        setProducts([]);
      }
    };
    void run();
  }, [token]);

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (token === null) return;
    setError(null);
    const clean = items.filter((i) => i.productId.length > 0 && i.quantity > 0);
    if (clean.length === 0) {
      setError('Inclua ao menos um item válido');
      return;
    }
    try {
      await httpJson<Order>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            status,
            notes,
            items: clean.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          }),
        },
        token
      );
      navigate('/orders');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Erro ao criar');
    }
  };

  return (
    <div className="page">
      <h1>Novo pedido</h1>
      <ErrorBanner message={error} />
      <div className="admin-form-panel">
        <form onSubmit={(e) => void onSubmit(e)} className="stack narrow">
          <SelectField
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            required
          />
          <TextAreaField
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <OrderItemsEditor items={items} products={products} onChange={setItems} />
          <FormActions>
            <Button type="submit">Salvar</Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
};
