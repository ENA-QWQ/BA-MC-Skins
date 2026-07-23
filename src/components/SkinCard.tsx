import { Link } from 'react-router-dom';
import { SkinItem } from '../types';
import { SkinViewer3D } from './SkinViewer3D';

interface SkinCardProps {
    skin: SkinItem;
    showUpdatedAt?: boolean;
    showCharacterName?: boolean;
}

export function SkinCard({ skin, showUpdatedAt = false, showCharacterName = true }: SkinCardProps) {
    const formattedDate = new Date(skin.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    function formatCharacterName(id: string): string {
        return id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    return (
        <Link to={`/skin/${skin.id}`} className="skin-card">
            <div className="skin-viewer-container">
                <SkinViewer3D
                    skinUrl={skin.downloadUrl}
                    width={150}
                    height={300}
                    autoRotate={false}
                    enableRotate={true}
                    enableZoom={false}
                />
            </div>
            {showCharacterName && <div className="skin-name">{formatCharacterName(skin.character)}</div>}
            <div className="skin-variant">{skin.variant.replace(/_/g, ' ')}</div>
            {showUpdatedAt && (
                <div className="skin-updated">Updated: {formattedDate}</div>
            )}
        </Link>
    );
}