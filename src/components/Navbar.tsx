import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, Tv, X } from 'lucide-react';
import { getSuggestions, Anime } from '../lib/api';

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
    { to: "/list/most-popular", label: "Most Popular" },
    { to: "/list/top-airing", label: "Top Airing" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[var(--color-surface)]">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-accent font-black text-2xl tracking-tighter flex items-center gap-2">
            ANIMXER
          </Link>

          {/* Desktop Links - Match Design */}
          <div className="hidden lg:flex gap-6 text-sm font-medium text-white/60">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`hover:text-white cursor-pointer h-16 flex items-center ${location.pathname === link.to ? 'text-white border-b-2 border-accent' : ''}`}
              >
                {link.label}
              </Link>
            ))}
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
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-accent/50 text-white placeholder-white/30"
            />
            <button type="submit" className="absolute right-4 top-2.5 text-white/40 hover:text-accent transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col z-[100]">
                {suggestions.map(anime => (
                  <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                    }}
                  >
                    <img src={anime.poster} alt={anime.name} className="w-10 h-14 object-cover rounded shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white line-clamp-1">{anime.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/50">{anime.jname || anime.type || 'TV'}</span>
                        {anime.rating && (
                          <span className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-white/70">
                            {anime.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Profile Avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-[var(--color-accent-secondary)]"></div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-[var(--color-background)] lg:hidden flex flex-col items-center pt-8 overflow-y-auto">
          <form 
            onSubmit={handleSearch} 
            className="relative w-full max-w-sm px-6 mb-8 sm:hidden"
          >
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-base focus:outline-none focus:border-accent/50 text-white placeholder-white/30"
            />
            <button type="submit" className="absolute right-10 top-3.5 text-white/40 hover:text-accent transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-col gap-6 text-xl font-medium text-center w-full">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className={`py-2 px-6 w-full ${location.pathname === link.to ? 'text-accent bg-white/5 font-bold' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
