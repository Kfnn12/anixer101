import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, Tv, X, ChevronRight } from 'lucide-react';
import { getSuggestions, Anime } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(searchQuery);
        setSuggestions(res.suggestions.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/az-list", label: "A-Z List" },
    { to: "/list/movie", label: "Movies" },
    { to: "/list/tv", label: "TV Series" },
    { to: "/list/trending", label: "Trending" },
    { to: "/list/upcoming", label: "Upcoming" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[var(--color-surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group translate-z-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[var(--color-accent-secondary)] shadow-lg shadow-accent/20 overflow-hidden transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
              <Tv className="w-5 h-5 text-white drop-shadow-md relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 leading-none">
                ANIMXER
              </span>
              <span className="text-[0.6rem] font-black tracking-[0.2em] text-accent uppercase leading-none mt-1 opacity-80">
                Anime World
              </span>
            </div>
          </Link>

          {/* Desktop Links - Match Design */}
          <div className="hidden lg:flex gap-1 text-sm font-medium text-white/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={`relative px-4 h-16 flex items-center transition-colors hover:text-white ${isActive ? 'text-white' : ''}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <form 
            onSubmit={handleSearch} 
            className="relative w-48 sm:w-64 hidden sm:block"
          >
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-black/20 border border-white/10 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/5 transition-all text-white placeholder-white/30"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent transition-colors">
              <Search className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-[var(--color-surface)] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-[100]"
                >
                  {suggestions.map((anime, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={anime.id}
                    >
                      <Link
                        to={`/anime/${anime.id}`}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        onClick={() => {
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                      >
                        <img src={anime.poster} alt={anime.name} className="w-12 h-16 object-cover rounded shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white line-clamp-1">{anime.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/50">{anime.jname || anime.type || 'TV'}</span>
                            {anime.rating && (
                              <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-medium">
                                {anime.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Profile Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-[var(--color-accent-secondary)] shadow-lg shadow-accent/20 cursor-pointer transform hover:scale-105 transition-transform"></div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden relative z-[60] w-10 h-10 flex items-center justify-center text-white/70 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-[var(--color-surface)] border-l border-white/10 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="h-16 border-b border-white/5 flex items-center px-6">
                 <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Navigation</span>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-6">
                <form 
                  onSubmit={handleSearch} 
                  className="relative w-full mb-8 sm:hidden group"
                >
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-5 text-base focus:outline-none focus:border-accent/50 focus:bg-white/5 transition-all text-white placeholder-white/30"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-accent transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </form>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link, i) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        key={link.to}
                      >
                        <Link 
                          to={link.to} 
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isActive ? 'bg-accent/10 text-accent font-bold border border-accent/20' : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'}`}
                        >
                          <span className="text-lg">{link.label}</span>
                          {isActive && <ChevronRight className="w-5 h-5" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
