import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Category } from '@ecommerce/shared';
import { useAuth } from '../../context/AuthContext';
import { httpJson, ApiRequestError } from '../../services/http';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { FormActions } from '../../components/ui/FormActions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';

export const CategoryEditPage = (): React.ReactElement => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      if (token === null || id === undefined) return;
      setError(null);
      try {
        const row = await httpJson<Category>(
          `/categories/${id}`,
          { method: 'GET' },
          token
        );
        setName(row.name);
        setDescription(row.description);
      } catch (e) {
        if (e instanceof ApiRequestError) setError(e.message);
        else setError('Erro ao carregar');
      }
    };
    void run();
  }, [token, id]);

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (token === null || id === undefined) return;
    setError(null);
    if (name.trim().length === 0 || description.trim().length === 0) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    try {
      await httpJson<Category>(
        `/categories/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ name, description }),
        },
        token
      );
      navigate('/categories');
    } catch (e) {
      if (e instanceof ApiRequestError) setError(e.message);
      else setError('Erro ao salvar');
    }
  };

  return (
    <div className="page">
      <h1>Editar categoria</h1>
      <ErrorBanner message={error} />
      <div className="admin-form-panel">
        <form onSubmit={(e) => void onSubmit(e)} className="stack narrow">
          <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <FormActions>
            <Button type="submit">Salvar</Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
};
