import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components';
import Home from './pages/Home';
import Search from './pages/Search';
import AnimeDetails from './pages/AnimeDetails';
import WatchEpisode from './pages/WatchEpisode';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-white relative">
        <div className="atmosphere-bg" />
        <Navbar />
        <main className="relative z-10 w-full overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:episodeId" element={<WatchEpisode />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
