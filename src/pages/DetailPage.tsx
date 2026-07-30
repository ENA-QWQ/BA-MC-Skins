import { useParams, useNavigate } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { SkinViewer3D } from '../components/SkinViewer3D';
import { DownloadButton } from '../components/DownloadButton';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

function formatName(id: string): string {
    return id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function DetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useSkinData();
    const { config } = useSiteConfig();
    const navigate = useNavigate();

    if (loading) return <div className="loading-text">Loading...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    const skin = data.find((s) => s.id === id);
    if (!skin) {
        return (
            <div className="not-found">
                <h2>Skin not found</h2>
                <span className="back-link" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </span>
            </div>
        );
    }

    const displayNameMap = config?.displayNameMap || {};
    const gameDisplay = displayNameMap[skin.game] || formatName(skin.game);
    const characterDisplay = formatName(skin.character);
    const variantDisplay = skin.variant.replace(/_/g, ' ');
    const formattedDate = new Date(skin.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const repoOwner = config?.repoOwner || 'unknown';
    const repoName = config?.repoName || 'unknown';
    const branch = config?.branch || 'main';
    const githubEditUrl = `https://github.com/${repoOwner}/${repoName}/edit/${branch}/skins/${skin.game}/${skin.character}/${skin.variant}.png`;

    return (
        <div className="layout">
            <Header title={`${characterDisplay} - ${variantDisplay}`} showBack={true} />
            <div className="detail-container">
                <div className="detail-card">
                    <div className="detail-left">
                        <SkinViewer3D
                            skinUrl={skin.downloadUrl}
                            width={180}
                            height={360}
                            autoRotate={true}
                            enableRotate={true}
                            enableZoom={true}
                        />
                    </div>
                    <div className="detail-right">
                        <div className="detail-title">{characterDisplay}</div>
                        <div className="detail-meta">
                            <span>Game: {gameDisplay}</span>
                            <span>Variant: {variantDisplay}</span>
                            <span>Updated: {formattedDate}</span>
                            <span>Author: {skin.author}</span>
                            <span>ID: {skin.id}</span>
                        </div>
                        <div className="detail-meta" style={{ marginTop: '8px' }}>
                            <span>Original: {skin.isOriginal ? 'Yes' : 'No'}</span>
                            {skin.originalAuthor && <span>Original Author: {skin.originalAuthor}</span>}
                            {skin.originalSource && <span>Source: {skin.originalSource}</span>}
                            {skin.license && <span>License: {skin.license}</span>}
                            {skin.note && <span>Note: {skin.note}</span>}
                        </div>
                        <div className="detail-actions">
                            <DownloadButton url={skin.downloadUrl} filename={`${skin.character}_${skin.variant}.png`} />
                            <a href={githubEditUrl} target="_blank" rel="noopener noreferrer" className="github-edit-btn">
                                Edit on GitHub
                            </a>
                        </div>
                        <div className="detail-sha">SHA-256: {skin.sha256}</div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}