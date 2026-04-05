// Site navigation kind type
export type SiteNavKind = 'internal' | 'external';

// Site navigation item type
export type SiteNavItem = {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly kind: SiteNavKind;
};

// Site navigation response type
export type SiteNavigationResponse = {
  readonly brand: { readonly label: string; readonly path: string };
  readonly nav: readonly SiteNavItem[];
  readonly footer: {
    readonly tagline: string;
    readonly linkGroups: readonly {
      readonly title: string;
      readonly links: readonly SiteNavItem[];
    }[];
    readonly whatsappUrl: string;
    readonly whatsappDisplay: string;
    readonly social: readonly {
      readonly id: string;
      readonly label: string;
      readonly url: string;
    }[];
  };
};

// App menu response type
export type AppMenuResponse = {
  readonly items: readonly { readonly label: string; readonly path: string }[];
  readonly brandHome: string;
};
