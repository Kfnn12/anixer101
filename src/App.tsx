import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'motion/react';
import PageTransition from './components/PageTransition';
import { ErrorBoundary } from './components/ErrorBoundary';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/list/:type" element={<PageTransition><List /></PageTransition>} />
        <Route path="/genre/:type" element={<PageTransition><List isGenre={true} /></PageTransition>} />
        <Route path="/az-list" element={<PageTransition><AZList /></PageTransition>} />
        <Route path="/az-list/:letter" element={<PageTransition><AZList /></PageTransition>} />
        <Route path="/anime/:id" element={<PageTransition><AnimeDetails /></PageTransition>} />
        <Route path="/watch/:episodeId" element={<PageTransition><WatchEpisode /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/dmca" element={<PageTransition><DMCA /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen text-white relative">
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
        <div className="atmosphere-bg" />
        <Navbar />
        <main className="relative z-10 w-full overflow-hidden">
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
