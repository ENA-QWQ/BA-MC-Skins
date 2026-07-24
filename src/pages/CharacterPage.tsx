import { useParams, Link } from 'react-router-dom';
import { useSkinData } from '../hooks/useSkinData';
import { SkinCard } from '../components/SkinCard';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

function formatCharacterName(id: string): string {
    return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function CharacterPage() {
    const { characterName } = useParams<{ characterName: string }>();
    const { data, loading, error } = useSkinData();

    if (loading) return <div className="loading-text">Loading...</div>;
    if (error) return <div className="error-text">Error: {error}</div>;

    const skins = data
        .filter((s) => s.character === characterName)
        .sort((a, b) => a.variant.localeCompare(b.variant));

    if (!characterName || skins.length === 0) {
        return (
            <div className="not-found">
                <h2>Character not found</h2>
                <Link to="/" className="back-link">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </Link>
            </div>
        );
    }

    const displayName = formatCharacterName(characterName);

    return (
        <div className="layout">
            <Header title={displayName} showBack={true} />
            <section className="section">
                <div className="skins-grid">
                    {skins.map((skin) => (
                        <SkinCard key={skin.id} skin={skin} showUpdatedAt={true} showCharacterName={false} />
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    );
}