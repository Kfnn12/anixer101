import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Tv } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 w-full border-b border-white/5 flex items-center justify-between px-8 bg-[var(--color-surface)]">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-accent font-black text-2xl tracking-tighter flex items-center gap-2">
          KAIDO
        </Link>

        {/* Desktop Links - Match Design */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-white/60">
          <Link to="/" className="text-white border-b-2 border-accent h-16 flex items-center">Home</Link>
          <span className="hover:text-white cursor-pointer h-16 flex items-center">Movies</span>
          <span className="hover:text-white cursor-pointer h-16 flex items-center">TV Series</span>
          <span className="hover:text-white cursor-pointer h-16 flex items-center">Most Popular</span>
          <span className="hover:text-white cursor-pointer h-16 flex items-center">Top Airing</span>
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
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-accent/50 text-white placeholder-white/30"
          />
          <button type="submit" className="absolute right-4 top-2.5 text-white/40 hover:text-accent transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
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
