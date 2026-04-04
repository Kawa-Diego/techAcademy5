import {
  useEffect,
  useState,
  type ReactElement,
} from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import type { Category, SiteNavigationResponse } from '@ecommerce/shared';
import { LoginModal } from '../components/LoginModal';
import { Navbar } from '../components/Navbar';
import { PublicFooter } from '../components/PublicFooter';
import { RegisterModal } from '../components/RegisterModal';
import { httpJson } from '../services/http';
import type { PublicLayoutOutletContext } from '@ecommerce/shared';

export const PublicLayout = (): ReactElement => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [nav, setNav] = useState<SiteNavigationResponse | null>(null);
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginPrefillEmail, setLoginPrefillEmail] = useState<string | null>(null);

  useEffect(() => {
    void httpJson<SiteNavigationResponse>(
      '/site/navigation',
      { method: 'GET' },
      null
    )
      .then(setNav)
      .catch(() => setNav(null));
  }, []);

  useEffect(() => {
    void httpJson<{ readonly data: Category[] }>(
      '/public/categories',
      { method: 'GET' },
      null
    )
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (searchParams.get('cadastro') === '1') {
      setIsRegisterModalOpen(true);
      setIsLoginModalOpen(false);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
      setSearchParams((prev) => {
        const n = new URLSearchParams(prev);
        n.delete('login');
        return n;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const outletContext: PublicLayoutOutletContext = {
    categories,
    navigation: nav,
  };

  const returnTo = searchParams.get('next');

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-amber-500/30 selection:text-amber-100">
      <Navbar
        navigation={nav}
        categories={categories}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginPrefillEmail(null);
        }}
        onOpenRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
        returnTo={returnTo}
        prefilledEmail={loginPrefillEmail}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onOpenLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
        onRegistered={(registeredEmail) => {
          setLoginPrefillEmail(registeredEmail);
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      <Outlet context={outletContext} />

      {nav ? (
        <PublicFooter navigation={nav} onLoginClick={() => setIsLoginModalOpen(true)} />
      ) : null}
    </div>
  );
};
