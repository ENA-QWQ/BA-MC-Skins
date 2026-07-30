import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { CharacterPage } from './pages/CharacterPage';
import { DetailPage } from './pages/DetailPage';

function App() {
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