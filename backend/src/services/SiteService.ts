import type {
  AppMenuResponse,
  SiteNavigationResponse,
  UserRole,
} from '@ecommerce/shared';

const publicNavigation = (): SiteNavigationResponse => ({
  brand: { label: 'LUMIÈRE', path: '/' },
  nav: [
    {
      id: 'sobre',
      label: 'Sobre',
      path: '/#sobre',
      kind: 'internal',
    },
    {
      id: 'vitrine',
      label: 'Produtos',
      path: '/vitrine',
      kind: 'internal',
    },
    {
      id: 'contato',
      label: 'Contato',
      path: '/#contato',
      kind: 'internal',
    },
  ],
  footer: {
    tagline:
      'Elevando sua experiência de compras para o próximo nível.',
    linkGroups: [
      {
        title: 'Links úteis',
        links: [
          {
            id: 'sobre',
            label: 'Sobre nós',
            path: '/#sobre',
            kind: 'internal',
          },
          {
            id: 'vitrine',
            label: 'Produtos',
            path: '/vitrine',
            kind: 'internal',
          },
          {
            id: 'contato',
            label: 'Contato',
            path: '/#contato',
            kind: 'internal',
          },
        ],
      },
    ],
    whatsappUrl:
      'https://wa.me/0000000000?text=Olá, gostaria de saber mais sobre os produtos.',
    whatsappDisplay: '(00) 0000-0000',
    social: [
      {
        id: 'instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/',
      },
      {
        id: 'x',
        label: 'X',
        url: 'https://x.com/',
      },
    ],
  },
});

const appMenuForRole = (role: UserRole): AppMenuResponse => {
  const adminItems: AppMenuResponse['items'] = [
    { label: 'Início', path: '/dashboard' },
    { label: 'Usuários', path: '/users' },
    { label: 'Categorias', path: '/categories' },
    { label: 'Produtos', path: '/products' },
    { label: 'Pedidos', path: '/orders' },
    { label: 'Minha conta', path: '/profile/edit' },
  ];
  if (role === 'ADMIN') {
    return {
      brandHome: '/dashboard',
      items: adminItems,
    };
  }
  return {
    brandHome: '/orders',
    items: [
      { label: 'Pedidos', path: '/orders' },
      { label: 'Minha conta', path: '/profile/edit' },
    ],
  };
};

export class SiteService {
  public getPublicNavigation(): SiteNavigationResponse {
    return publicNavigation();
  }

  public getAppMenu(role: UserRole): AppMenuResponse {
    return appMenuForRole(role);
  }
}
