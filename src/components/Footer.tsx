import { useSiteConfig } from '../hooks/useSiteConfig';

export function Footer() {
    const { config } = useSiteConfig();
    const repoOwner = config?.repoOwner || 'ENA-QWQ';
    const repoName = config?.repoName || 'BA-MC-Skins';
    const githubUrl = `https://github.com/${repoOwner}/${repoName}`;

    return (
        <footer className="footer">
            <div className="footer-left">
                By <a href="https://enashpinal.pages.dev" target="_blank" rel="noopener noreferrer">ENA</a>
            </div>
            <div className="footer-right">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">Source on GitHub</a>
            </div>
        </footer>
    );
}