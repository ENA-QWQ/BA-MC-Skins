import { useState, useEffect } from 'react';

interface SiteConfig {
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

export function useSiteConfig() {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const url = `${base}site.config.json`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch config');
                return res.json();
            })
            .then((data) => setConfig(data))
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);
    return { config, loading, error };
}