import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = (): React.ReactElement => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading session…
      </div>
    );
  }
  if (token === null) return <Navigate to="/" replace />;
  return <Outlet />;
};
