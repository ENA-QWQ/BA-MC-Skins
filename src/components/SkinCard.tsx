import { Link } from 'react-router-dom';
import { SkinItem } from '../types';
import { SkinViewer3D } from './SkinViewer3D';
import { useSiteConfig } from '../hooks/useSiteConfig';

interface SkinCardProps {
    skin: SkinItem;
    showUpdatedAt?: boolean;
    showCharacterName?: boolean;
}

function formatName(id: string): string {
    return id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function SkinCard({ skin, showUpdatedAt = false, showCharacterName = true }: SkinCardProps) {
    const { config } = useSiteConfig();
    const displayNameMap = config?.displayNameMap || {};

    const formattedDate = new Date(skin.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const characterDisplayName = displayNameMap[skin.character] || formatName(skin.character);

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
            {showCharacterName && <div className="skin-name">{characterDisplayName}</div>}
            <div className={showCharacterName ? "skin-variant" : "skin-name"}>{skin.variant.replace(/_/g, ' ')}</div>
            {showUpdatedAt && (
                <div className="skin-updated">Updated: {formattedDate}</div>
            )}
        </Link>
    );
}