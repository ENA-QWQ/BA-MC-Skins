import { useParams, Link } from 'react-router-dom';
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

export function GamePage() {
    const { gameName } = useParams<{ gameName: string }>();
    const { data, loading, error } = useSkinData();
    const { config } = useSiteConfig();

    if (loading) return <div className="loading-text">Loading...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    const gameSkins = data.filter((s) => s.game === gameName);
    if (gameSkins.length === 0) {
        return (
            <div className="not-found">
                <h2>Game not found</h2>
                <Link to="/" className="back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </Link>
            </div>
        );
    }

    const displayNameMap = config?.displayNameMap || {};
    const displayGameName = displayNameMap[gameName!] || formatName(gameName!);

    const characterMap = new Map<string, typeof data>();
    gameSkins.forEach((skin) => {
        if (!characterMap.has(skin.character)) characterMap.set(skin.character, []);
        characterMap.get(skin.character)!.push(skin);
    });
    const characters = Array.from(characterMap.entries()).map(([character, skins]) => ({
        character,
        skins,
    }));

    return (
        <div className="layout">
            <Header title={displayGameName} showBack={true} />
            <section className="section">
                <div className="characters-grid">
                    {characters.map(({ character, skins }) => {
                        const preview = skins.find((s) => s.variant === 'Default') || skins[0];
                        const linkTo =
                            skins.length === 1
                                ? `/skin/${skins[0].id}`
                                : `/game/${gameName}/character/${character}`;
                        return (
                            <Link key={character} to={linkTo} className="character-card">
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
                                <div className="character-name">{formatName(character)}</div>
                                <div className="character-count">{skins.length} variant{skins.length > 1 ? 's' : ''}</div>
                            </Link>
                        );
                    })}
                </div>
            </section>
            <Footer />
        </div>
    );
}