import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { CharacterPage } from './pages/CharacterPage';
import { DetailPage } from './pages/DetailPage';
import { useSiteConfig } from './hooks/useSiteConfig';

function App() {
    const { config, loading } = useSiteConfig();

    useEffect(() => {
        if (!loading && config?.siteTitle) {
            document.title = config.siteTitle;
        } else if (!loading) {
            document.title = 'Skin Gallery';
        }
    }, [config, loading]);

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:gameName" element={<GamePage />} />
            <Route path="/game/:gameName/character/:characterName" element={<CharacterPage />} />
            <Route path="/skin/:id" element={<DetailPage />} />
        </Routes>
    );
}

export default App;