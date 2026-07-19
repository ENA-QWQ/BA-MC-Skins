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

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading assets...</div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: {error}</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                    BA Minecraft Skins
                </h1>
                <input
                    type="text"
                    placeholder="Search character or variant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px 16px',
                        fontSize: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none'
                    }}
                />
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px'
            }}>
                {filteredSkins.map((skin) => (
                    <SkinCard key={skin.id} skin={skin} />
                ))}
            </div>

            {filteredSkins.length === 0 && (
                <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '40px' }}>
                    No skins found matching "{searchTerm}"
                </p>
            )}
        </div>
    );
}