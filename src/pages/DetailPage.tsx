import { useParams, Link } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { SkinViewer3D } from '../components/SkinViewer3D';
import { DownloadButton } from '../components/DownloadButton';

export function DetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data, loading, error } = useSkinData();

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

    const skin = data.find((s) => s.id === id);

    if (!skin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Skin not found</h2>
                <Link to="/" style={{ color: '#3b82f6', marginTop: '16px', display: 'inline-block' }}>
                    ← Back to Gallery
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
                ← Back to Gallery
            </Link>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <SkinViewer3D skinUrl={skin.downloadUrl} width={300} height={600} autoRotate={true} />

                <div style={{ marginTop: '32px', textAlign: 'center', width: '100%' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        {skin.character}
                    </h1>
                    <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px', textTransform: 'capitalize' }}>
                        Variant: {skin.variant.replace(/_/g, ' ')}
                    </p>

                    <div style={{ marginBottom: '24px', padding: '12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                        SHA-256: {skin.sha256}
                    </div>

                    <DownloadButton url={skin.downloadUrl} filename={`${skin.character}_${skin.variant}.png`} />
                </div>
            </div>
        </div>
    );
}