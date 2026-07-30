export interface SiteConfig {
    siteTitle: string;
    siteDescription: string;
    repoOwner: string;
    repoName: string;
    branch: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        bgPattern: string;
    };
    displayNameMap: Record<string, string>;
    enableSearch: boolean;
    defaultVariant: string;
    allowExternalImports: boolean;
    requireSourceForImports: boolean;
}