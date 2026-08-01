import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { CharacterPage } from './pages/CharacterPage';
import { DetailPage } from './pages/DetailPage';
import { useSiteConfig } from './hooks/useSiteConfig';

function App() {
    const { config } = useSiteConfig();

    useEffect(() => {
        document.title = config?.siteTitle || 'Skin Gallery';
        const root = document.documentElement;
        const theme = config?.theme || {};
        root.style.setProperty('--primary-color', theme.primaryColor || '#2d2d2d');
        root.style.setProperty('--secondary-color', theme.secondaryColor || '#888888');
        root.style.setProperty('--text-color', theme.textColor || '#1f2937');
        root.style.setProperty('--text-light', theme.textLight || '#6b7280');
        root.style.setProperty('--bg-pattern', theme.bgPattern || 'repeating-linear-gradient(45deg, #c0ebfa, #c7e8ff 20px, #ffffff 20px, #ffffff 40px)');
    }, [config]);

    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/game/:gameName" element={<GamePage />} />
                <Route path="/game/:gameName/character/:characterName" element={<CharacterPage />} />
                <Route path="/skin/:id" element={<DetailPage />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;