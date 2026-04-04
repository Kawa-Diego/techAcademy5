import type { Product } from '@ecommerce/shared';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';

export type OrderItemDraft = {
  readonly productId: string;
  readonly quantity: number;
};

type Props = {
  readonly items: readonly OrderItemDraft[];
  readonly products: readonly Product[];
  readonly onChange: (next: OrderItemDraft[]) => void;
};

export const OrderItemsEditor = ({
  items,
  products,
  onChange,
}: Props): React.ReactElement => {
  const options = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id.slice(0, 8)}…)`,
  }));

  const patch = (index: number, draft: OrderItemDraft) => {
    const next = items.map((row, i) => (i === index ? draft : row));
    onChange([...next]);
  };

  const addRow = () => {
    onChange([...items, { productId: '', quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="stack">
      <h2>Itens</h2>
      {items.map((row, idx) => (
        <div key={idx} className="order-item-row">
          <SelectField
            label="Produto"
            name={`product-${String(idx)}`}
            value={row.productId}
            onChange={(e) =>
              patch(idx, { productId: e.target.value, quantity: row.quantity })
            }
            options={options}
            required
          />
          <TextField
            label="Quantidade"
            type="number"
            min={1}
            value={String(row.quantity)}
            onChange={(e) =>
              patch(idx, {
                productId: row.productId,
                quantity: Number(e.target.value),
              })
            }
            required
          />
          <Button type="button" variant="danger" onClick={() => removeRow(idx)}>
            Remover
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addRow}>
        Adicionar item
      </Button>
    </div>
  );
};
