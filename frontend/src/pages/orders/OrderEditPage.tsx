import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Order, OrderStatus, PaginatedResult, Product } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { SelectField } from '../../components/ui/SelectField';
import { TextAreaField } from '../../components/ui/TextAreaField';
import { Button } from '../../components/ui/Button';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { OrderItemsEditor, type OrderItemDraft } from './OrderItemsEditor';

const STATUSES: readonly OrderStatus[] = [
  'PENDING',
  'PAID',
  'SHIPPED',
  'CANCELLED',
] as const;

export const OrderEditPage = (): React.ReactElement => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([]);
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

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (token === null || id === undefined) return;
      setError(null);
      try {
        const row = await httpJson<Order>(
          `/orders/${id}`,
          { method: 'GET' },
          token
        );
        setStatus(row.status);
        setNotes(row.notes);
        setItems(row.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      } catch (e) {
        if (e instanceof ApiRequestError) setError(e.message);
        else setError('Failed to load');
      }
    };
    void run();
  }, [token, id]);

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (token === null || id === undefined) return;
    setError(null);
    const clean = items.filter((i) => i.productId.length > 0 && i.quantity > 0);
    if (clean.length === 0) {
      setError('Include at least one valid line item');
      return;
    }
    try {
      await httpJson<Order>(
        `/orders/${id}`,
        {
          method: 'PUT',
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
      else setError('Failed to save');
    }
  };

  return (
    <div className="page">
      <h1>Edit order</h1>
      <ErrorBanner message={error} />
      <form onSubmit={(e) => void onSubmit(e)} className="stack narrow">
        <SelectField
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          options={STATUSES.map((s) => ({ value: s, label: s }))}
          required
        />
        <TextAreaField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        <OrderItemsEditor items={items} products={products} onChange={setItems} />
        <FormActions>
          <Button type="submit">Save</Button>
        </FormActions>
      </form>
    </div>
  );
};
