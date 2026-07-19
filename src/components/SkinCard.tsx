import { Link } from 'react-router-dom';
import { SkinItem } from '../types';
import { SkinViewer3D } from './SkinViewer3D';

interface SkinCardProps {
    skin: SkinItem;
}

export function SkinCard({ skin }: SkinCardProps) {
    return (
        <Link to={`/skin/${skin.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                background: 'white'
            }}
                 onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                 }}
                 onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = 'none';
                 }}
            >
                <SkinViewer3D skinUrl={skin.downloadUrl} width={150} height={300} autoRotate={false} />
                <h3 style={{ marginTop: '12px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {skin.character}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>
                    {skin.variant.replace(/_/g, ' ')}
                </p>
            </div>
        </Link>
    );
}