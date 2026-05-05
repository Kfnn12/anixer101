import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Tv } from 'lucide-react';
import { getSuggestions, Anime } from '../lib/api';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 w-full border-b border-white/5 flex items-center justify-between px-8 bg-[var(--color-surface)]">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-accent font-black text-2xl tracking-tighter flex items-center gap-2">
          ANIMXER
        </Link>

        {/* Desktop Links - Match Design */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-white/60">
          <Link to="/" className="text-white border-b-2 border-accent h-16 flex items-center">Home</Link>
          <Link to="/az-list" className="hover:text-white cursor-pointer h-16 flex items-center">A-Z List</Link>
          <Link to="/list/movie" className="hover:text-white cursor-pointer h-16 flex items-center">Movies</Link>
          <Link to="/list/tv" className="hover:text-white cursor-pointer h-16 flex items-center">TV Series</Link>
          <Link to="/list/most-popular" className="hover:text-white cursor-pointer h-16 flex items-center">Most Popular</Link>
          <Link to="/list/top-airing" className="hover:text-white cursor-pointer h-16 flex items-center">Top Airing</Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <form 
          onSubmit={handleSearch} 
          className="relative w-64 hidden sm:block"
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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
        <button className="md:hidden text-white/70 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
