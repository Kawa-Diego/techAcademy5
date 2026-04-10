import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, PaginatedResult, Product } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, httpFormData, httpJson, mediaUrl } from '../../services/http';
import { describeUploadError } from '../../services/uploadErrorMessage';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';
import { Button } from '../../components/ui/Button';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const ProductNewPage = (): React.ReactElement => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [model3dUrl, setModel3dUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (token === null) return;
      try {
        const res = await httpJson<PaginatedResult<Category>>(
          '/categories?page=1&pageSize=100',
          { method: 'GET' },
          token
        );
        setCategories([...res.data]);
      } catch {
        setCategories([]);
      }
    };
    void run();
  }, [token]);

  const onPickFiles = async (
    ev: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = ev.target.files;
    if (!files?.length || token === null) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { urls } = await httpFormData<{ urls: string[] }>(
        '/upload/images',
        fd,
        token
      );
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (e) {
      setError(describeUploadError(e));
    } finally {
      setUploading(false);
      ev.target.value = '';
    }
  };

  const removeImage = (idx: number): void => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (token === null) return;
    setError(null);
    const priceCents = Math.round(Number(price.replace(',', '.')) * 100);
    const stock = Math.round(Number(stockQuantity.replace(',', '.')));
    if (
      name.trim().length === 0 ||
      description.trim().length === 0 ||
      model3dUrl.trim().length === 0 ||
      categoryId.length === 0 ||
      Number.isNaN(priceCents) ||
      priceCents < 0 ||
      Number.isNaN(stock) ||
      stock < 0
    ) {
      setError('Fill in all fields correctly');
      return;
    }
    if (imageUrls.length === 0) {
      setError('Upload at least one image');
      return;
    }
    try {
      await httpJson<Product>(
        '/products',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            description,
            priceCents,
            model3dUrl,
            categoryId,
            imageUrls,
            stockQuantity: stock,
          }),
        },
        token
      );
      navigate('/products');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to create');
    }
  };

  return (
    <div className="page">
      <h1>New product</h1>
      <ErrorBanner message={error} />
      <div className="admin-form-panel">
        <form onSubmit={(e) => void onSubmit(e)} className="stack narrow">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} autoComplete="off" required />
          <TextField label="Price (BRL)" value={price} onChange={(e) => setPrice(e.target.value)} autoComplete="off" required />
          <TextField
            label="Stock (units)"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            autoComplete="off"
            required
          />
          <TextField label="3D model URL" value={model3dUrl} onChange={(e) => setModel3dUrl(e.target.value)} required />
          <SelectField
            label="Category"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            required
          />
          <div className="field">
            <label htmlFor="product-images">Product images</label>
            <input
              id="product-images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              disabled={uploading || token === null}
              onChange={(e) => void onPickFiles(e)}
              className="text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              One or more images (max. 12 per upload). Common image formats.
            </p>
            {uploading ? <p className="text-sm text-slate-400">Uploading…</p> : null}
            {imageUrls.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <li key={`${url}-${String(i)}`} className="relative">
                    <img
                      src={mediaUrl(url)}
                      alt=""
                      className="h-20 w-20 rounded-lg border border-amber-500/35 object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white"
                      onClick={() => removeImage(i)}
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <FormActions>
            <Button type="submit" className="w-full">Save</Button>
          </FormActions>
          <button type="button" className="btn btn-secondary mt-4 w-full" onClick={() => navigate('/products')}>Back</button>
        </form>
      </div>
    </div>
  );
};
