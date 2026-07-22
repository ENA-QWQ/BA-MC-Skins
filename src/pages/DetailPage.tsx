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
            <div className="layout-wrapper" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <h2>Skin not found</h2>
                <Link to="/" className="detail-back" style={{ marginTop: '16px', display: 'inline-block' }}>
                    ← Back to Gallery
                </Link>
            </div>
        );
    }

    return (
        <div className="layout-wrapper">
            <Link to="/" className="detail-back">
                ← Back to Gallery
            </Link>

            <div className="detail-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SkinViewer3D skinUrl={skin.downloadUrl} width={300} height={600} autoRotate={true} />

                <div style={{ marginTop: '32px', textAlign: 'center', width: '100%' }}>
                    <h1 className="detail-title">{skin.character}</h1>
                    <p className="detail-variant">Variant: {skin.variant.replace(/_/g, ' ')}</p>

                    <div className="detail-sha">SHA-256: {skin.sha256}</div>

                    <DownloadButton url={skin.downloadUrl} filename={`${skin.character}_${skin.variant}.png`} />
                </div>
            </div>
        </div>
    );
}