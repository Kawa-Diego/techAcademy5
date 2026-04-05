import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const CategoryNewPage = (): React.ReactElement => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (token === null) return;
    setError(null);
    if (name.trim().length === 0 || description.trim().length === 0) {
      setError('Fill in all required fields');
      return;
    }
    try {
      await httpJson<Category>(
        '/categories',
        {
          method: 'POST',
          body: JSON.stringify({ name, description }),
        },
        token
      );
      navigate('/categories');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Failed to create');
    }
  };

  return (
    <div className="page">
      <h1>New category</h1>
      <ErrorBanner message={error} />
      <div className="admin-form-panel">
        <form onSubmit={(e) => void onSubmit(e)} className="stack narrow">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <FormActions>
            <Button type="submit">Save</Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
};
