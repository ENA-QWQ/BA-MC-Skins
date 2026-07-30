import { Link, useSearchParams } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { SkinViewer3D } from '../components/SkinViewer3D';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

function formatName(id: string): string {
    return id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function HomePage() {
    const { data, loading, error } = useSkinData();
    const { config, loading: configLoading } = useSiteConfig();
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const games = (() => {
        const map = new Map<string, { characters: Set<string>; skinCount: number }>();
        data.forEach((skin) => {
            if (!map.has(skin.game)) {
                map.set(skin.game, { characters: new Set(), skinCount: 0 });
            }
            const entry = map.get(skin.game)!;
            entry.characters.add(skin.character);
            entry.skinCount += 1;
        });
        return Array.from(map.entries()).map(([game, { characters, skinCount }]) => ({
            game,
            characterCount: characters.size,
            skinCount,
        }));
    })();

    const displayNameMap = config?.displayNameMap || {};

    const filteredGames = games.filter((g) =>
        g.game.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || configLoading) return <div className="loading-text">Loading assets...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    return (
        <div className="layout">
            <Header title={config?.siteTitle || 'Skin Gallery'} showBack={false} />
            <section className="section">
                <div className="characters-grid">
                    {filteredGames.map(({ game, characterCount, skinCount }) => {
                        const previewSkin = data.find((s) => s.game === game);
                        return (
                            <Link key={game} to={`/game/${game}`} className="character-card">
                                <div className="character-preview">
                                    {previewSkin && (
                                        <SkinViewer3D
                                            skinUrl={previewSkin.downloadUrl}
                                            width={160}
                                            height={320}
                                            autoRotate={false}
                                            enableRotate={true}
                                            enableZoom={false}
                                        />
                                    )}
                                </div>
                                <div className="character-name">
                                    {displayNameMap[game] || formatName(game)}
                                </div>
                                <div className="character-count">
                                    {characterCount} character{characterCount > 1 ? 's' : ''}, {skinCount} skin
                                    {skinCount > 1 ? 's' : ''}
                                </div>
                            </Link>
                        );
                    })}
                </div>
                {filteredGames.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                        No games found matching "{searchTerm}"
                    </p>
                )}
            </section>
            <Footer />
        </div>
    );
}