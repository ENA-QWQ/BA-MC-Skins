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
                <Link to="/" className="back-link">← Back to Gallery</Link>
            </div>
        );
    }

    return (
        <div className="layout">
            <div className="detail-container">
                <Link to="/" className="back-link">← Back to Gallery</Link>
                <div className="detail-card">
                    <div className="skin-viewer-container">
                        <SkinViewer3D skinUrl={skin.downloadUrl} width={300} height={600} autoRotate={true} />
                    </div>
                    <div className="detail-title">{skin.character}</div>
                    <div className="detail-variant">Variant: {skin.variant.replace(/_/g, ' ')}</div>
                    <div className="detail-sha">SHA-256: {skin.sha256}</div>
                    <DownloadButton url={skin.downloadUrl} filename={`${skin.character}_${skin.variant}.png`} />
                </div>
            </div>
        </div>
    );
}