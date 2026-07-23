import { useParams, Link } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { SkinViewer3D } from '../components/SkinViewer3D';
import { DownloadButton } from '../components/DownloadButton';

export function DetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useSkinData();

    if (loading) return <div className="loading-text">Loading...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    const skin = data.find((s) => s.id === id);

    if (!skin) {
        return (
            <div className="not-found">
                <h2>Skin not found</h2>
                <Link to="/" className="back-link">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </Link>
            </div>
        );
    }

    const formattedDate = new Date(skin.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const githubEditUrl = `https://github.com/ENA-QWQ/BA-MC-Skins/edit/main/skins/${skin.character}/${skin.variant}.png`;

    return (
        <div className="layout">
            <div className="detail-container">
                <Link to="/" className="back-link">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </Link>
                <div className="detail-card">
                    <div className="detail-left">
                        <SkinViewer3D
                            skinUrl={skin.downloadUrl}
                            width={250}
                            height={500}
                            autoRotate={true}
                            enableRotate={true}
                            enableZoom={true}
                        />
                    </div>
                    <div className="detail-right">
                        <div className="detail-title">{skin.character}</div>
                        <div className="detail-variant">
                            Variant: {skin.variant.replace(/_/g, ' ')}
                        </div>
                        <div className="detail-meta">
                            <span>Updated: {formattedDate}</span>
                            <span>Author: {skin.author}</span>
                        </div>
                        <div className="detail-sha">SHA-256: {skin.sha256}</div>
                        <DownloadButton
                            url={skin.downloadUrl}
                            filename={`${skin.character}_${skin.variant}.png`}
                        />
                        <a
                            href={githubEditUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="github-edit-link"
                        >
                            Edit this skin on GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}