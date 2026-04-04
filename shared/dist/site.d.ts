export type SiteNavKind = 'internal' | 'external';
export type SiteNavItem = {
    readonly id: string;
    readonly label: string;
    readonly path: string;
    readonly kind: SiteNavKind;
};
export type SiteNavigationResponse = {
    readonly brand: {
        readonly label: string;
        readonly path: string;
    };
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
export type AppMenuResponse = {
    readonly items: readonly {
        readonly label: string;
        readonly path: string;
    }[];
    readonly brandHome: string;
};
