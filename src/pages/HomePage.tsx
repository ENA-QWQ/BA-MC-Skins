import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { SkinViewer3D } from '../components/SkinViewer3D';

function formatCharacterName(id: string): string {
    return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function HomePage() {
    const { data, loading, error } = useSkinData();
    const [searchTerm, setSearchTerm] = useState('');

    const characters = useMemo(() => {
        const map = new Map<string, typeof data>();
        data.forEach((skin) => {
            if (!map.has(skin.character)) map.set(skin.character, []);
            map.get(skin.character)!.push(skin);
        });

        const result = [];
        for (const [character, skins] of map) {
            let preview = skins.find((s) => s.variant === 'Default');
            if (!preview) {
                preview = skins.sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                )[0];
            }
            result.push({
                character,
                preview,
                count: skins.length,
            });
        }
        return result.sort((a, b) => a.character.localeCompare(b.character));
    }, [data]);

    const filteredCharacters = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return characters.filter(
            (c) =>
                c.character.toLowerCase().includes(lowerTerm) ||
                c.preview.variant.toLowerCase().includes(lowerTerm)
        );
    }, [characters, searchTerm]);

    if (loading) return <div className="loading-text">Loading assets...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    return (
        <div className="layout">
            <section className="section">
                <div className="section-header">
                    <span className="section-title">BA Minecraft Skins</span>
                    <input
                        type="text"
                        placeholder="Search character or variant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="characters-grid">
                    {filteredCharacters.map(({ character, preview, count }) => (
                        <Link
                            key={character}
                            to={`/character/${character}`}
                            className="character-card"
                        >
                            <div className="character-preview">
                                <SkinViewer3D
                                    skinUrl={preview.downloadUrl}
                                    width={160}
                                    height={320}
                                    autoRotate={false}
                                    enableRotate={true}
                                    enableZoom={false}
                                />
                            </div>
                            <div className="character-name">{formatCharacterName(character)}</div>
                            <div className="character-count">
                                {count} variant{count > 1 ? 's' : ''}
                            </div>
                        </Link>
                    ))}
                </div>
                {filteredCharacters.length === 0 && (
                    <p
                        style={{
                            textAlign: 'center',
                            color: '#6b7280',
                            marginTop: '40px',
                        }}
                    >
                        No characters found matching "{searchTerm}"
                    </p>
                )}
            </section>
        </div>
    );
}