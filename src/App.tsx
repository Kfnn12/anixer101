import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components';
import Home from './pages/Home';
import Search from './pages/Search';
import List from './pages/List';
import AZList from './pages/AZList';
import AnimeDetails from './pages/AnimeDetails';
import WatchEpisode from './pages/WatchEpisode';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import DMCA from './pages/DMCA';
import Contact from './pages/Contact';

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
            <Route path="/list/:type" element={<List />} />
            <Route path="/genre/:type" element={<List isGenre={true} />} />
            <Route path="/az-list" element={<AZList />} />
            <Route path="/az-list/:letter" element={<AZList />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:episodeId" element={<WatchEpisode />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
