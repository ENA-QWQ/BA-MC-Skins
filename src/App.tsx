import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { CharacterPage } from './pages/CharacterPage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/:characterName" element={<CharacterPage />} />
            <Route path="/skin/:id" element={<DetailPage />} />
        </Routes>
    );
}

export default App;