import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { SocialNetworkIcon } from './SocialNetworkIcon';
import type { SiteNavigationResponse, SiteNavItem } from '@ecommerce/shared';

type Props = {
  readonly navigation: SiteNavigationResponse;
  readonly onLoginClick: () => void;
};

const NavLink = ({ item }: { readonly item: SiteNavItem }): ReactElement => {
  if (item.kind === 'external') {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-white"
      >
        {item.label}
      </a>
    );
  }
  const hashIdx = item.path.indexOf('#');
  if (hashIdx !== -1) {
    const pathname = item.path.slice(0, hashIdx) || '/';
    const hash = item.path.slice(hashIdx + 1);
    return (
      <Link to={{ pathname, hash }} className="transition-colors hover:text-white">
        {item.label}
      </Link>
    );
  }
  return (
    <Link to={item.path} className="transition-colors hover:text-white">
      {item.label}
    </Link>
  );
};

export const PublicFooter = ({
  navigation,
  onLoginClick,
}: Props): ReactElement => {
  const { footer } = navigation;
  return (
    <footer className="bg-slate-900 px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 text-slate-300 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Link
            to={navigation.brand.path}
            className="mb-6 block text-2xl font-black tracking-tight text-white"
          >
            {navigation.brand.label}
          </Link>
          <p className="mb-6 leading-relaxed">{footer.tagline}</p>
          <a
            href={footer.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-emerald-400 transition-colors hover:text-emerald-300"
          >
            <Phone className="h-5 w-5" />
            <span>{footer.whatsappDisplay}</span>
          </a>
        </div>
        <div className="flex flex-col gap-10">
          {footer.linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-6 font-bold text-white">{group.title}</h4>
              <div className="flex flex-col gap-4">
                {group.links.map((item) => (
                  <NavLink key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-left text-slate-300 transition-colors hover:text-white"
          >
            Entrar
          </button>
        </div>
        <div>
          <h4 className="mb-6 font-bold text-white">Redes sociais</h4>
          <div className="flex gap-4">
            {footer.social.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition-all hover:bg-indigo-600"
                aria-label={s.label}
              >
                <SocialNetworkIcon id={s.id} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
