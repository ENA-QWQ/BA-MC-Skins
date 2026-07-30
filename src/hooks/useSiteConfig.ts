import { useState, useEffect } from 'react';
import { SiteConfig } from '../types/config';

const defaultConfig: SiteConfig = {
    siteTitle: 'Skin Gallery',
    siteDescription: 'A community-driven skin gallery',
    repoOwner: 'unknown',
    repoName: 'unknown',
    branch: 'main',
    theme: {
        primaryColor: '#2d2d2d',
        secondaryColor: '#4a90d9',
        bgPattern: 'repeating-linear-gradient(45deg, #c0ebfa, #c7e8ff 20px, #ffffff 20px, #ffffff 40px)',
    },
    displayNameMap: {},
    enableSearch: true,
    defaultVariant: 'Default',
    allowExternalImports: false,
    requireSourceForImports: true,
};

export function useSiteConfig() {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const url = `${base}site.config.json`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch site.config.json');
                return res.json();
            })
            .then((data: SiteConfig) => {
                setConfig(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    return { config, loading, error };
}