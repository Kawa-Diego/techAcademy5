import type { ReactElement } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AdminOnlyOutlet = (): ReactElement => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/orders" replace />;
  }
  return <Outlet />;
};
