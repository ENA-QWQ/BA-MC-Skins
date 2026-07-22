import { Link } from 'react-router-dom';
import { SkinItem } from '../types';
import { SkinViewer3D } from './SkinViewer3D';

interface SkinCardProps {
    skin: SkinItem;
}

export function SkinCard({ skin }: SkinCardProps) {
    return (
        <Link to={`/skin/${skin.id}`} className="skin-card">
            <SkinViewer3D skinUrl={skin.downloadUrl} width={150} height={300} autoRotate={false} />
            <div className="skin-name">{skin.character}</div>
            <div className="skin-variant">{skin.variant.replace(/_/g, ' ')}</div>
        </Link>
    );
}