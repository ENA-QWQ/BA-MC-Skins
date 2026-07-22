import { useState, useMemo } from 'react';
import { useSkinData } from '../hooks/useSkinData';
import { SkinCard } from '../components/SkinCard';

export function HomePage() {
    const { data, loading, error } = useSkinData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkins = useMemo(() => {
        const lowerTerm = searchTerm.toLowerCase();
        return data.filter(
            (skin) =>
                skin.character.toLowerCase().includes(lowerTerm) ||
                skin.variant.toLowerCase().includes(lowerTerm)
        );
    }, [data, searchTerm]);

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
                <div className="skins-grid">
                    {filteredSkins.map((skin) => (
                        <SkinCard key={skin.id} skin={skin} />
                    ))}
                </div>
                {filteredSkins.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                        No skins found matching "{searchTerm}"
                    </p>
                )}
            </section>
        </div>
    );
}