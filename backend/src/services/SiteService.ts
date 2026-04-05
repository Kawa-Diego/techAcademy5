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
      label: 'About',
      path: '/#about',
      kind: 'internal',
    },
    {
      id: 'vitrine',
      label: 'Products',
      path: '/vitrine',
      kind: 'internal',
    },
    {
      id: 'contato',
      label: 'Contact',
      path: '/#contact',
      kind: 'internal',
    },
  ],
  footer: {
    tagline:
      'Elevating your shopping experience to the next level.',
    linkGroups: [
      {
        title: 'Useful links',
        links: [
          {
            id: 'sobre',
            label: 'About us',
            path: '/#about',
            kind: 'internal',
          },
          {
            id: 'vitrine',
            label: 'Products',
            path: '/vitrine',
            kind: 'internal',
          },
          {
            id: 'contato',
            label: 'Contact',
            path: '/#contact',
            kind: 'internal',
          },
        ],
      },
    ],
    whatsappUrl:
      'https://wa.me/0000000000?text=Hi,%20I%20would%20like%20to%20know%20more%20about%20your%20products.',
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
    { label: 'Home', path: '/dashboard' },
    { label: 'Users', path: '/users' },
    { label: 'Categories', path: '/categories' },
    { label: 'Products', path: '/products' },
    { label: 'Orders', path: '/orders' },
    { label: 'My account', path: '/profile/edit' },
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
      { label: 'Orders', path: '/orders' },
      { label: 'My account', path: '/profile/edit' },
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
