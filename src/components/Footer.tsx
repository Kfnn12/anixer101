import { Link } from 'react-router-dom';
import { Github, Twitter, MessageSquare, Tv } from 'lucide-react';

export default function Footer() {
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  return (
    <footer className="w-full border-t border-white/5 bg-[var(--color-surface)] mt-auto pt-16 pb-8 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          {/* Brand & Info */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[var(--color-accent-secondary)] shadow-lg shadow-accent/20 overflow-hidden transform duration-300 group-hover:scale-105">
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
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Animxer is a free anime streaming platform where you can watch english subbed and dubbed anime online. We don't host any files on our server, we only link to the media which is hosted on 3rd party services.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white transition-all">
                <MessageSquare size={18} fill="currentColor" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2 text-sm text-white/60">
              <li><Link to="/list/movie" className="hover:text-accent transition-colors">Movies</Link></li>
              <li><Link to="/list/tv" className="hover:text-accent transition-colors">TV Series</Link></li>
              <li><Link to="/list/most-popular" className="hover:text-accent transition-colors">Most Popular</Link></li>
              <li><Link to="/list/top-airing" className="hover:text-accent transition-colors">Top Airing</Link></li>
            </ul>
          </div>

          {/* Popular Genres */}
          <div className="md:col-span-6 lg:col-span-4">
            <h3 className="text-white font-bold mb-4">Popular Genres</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
              <Link to="/genre/action" className="hover:text-accent transition-colors">Action Anime</Link>
              <Link to="/genre/comedy" className="hover:text-accent transition-colors">Comedy Anime</Link>
              <Link to="/genre/romance" className="hover:text-accent transition-colors">Romance Anime</Link>
              <Link to="/genre/fantasy" className="hover:text-accent transition-colors">Fantasy Anime</Link>
              <Link to="/genre/isekai" className="hover:text-accent transition-colors">Isekai Anime</Link>
              <Link to="/genre/sci-fi" className="hover:text-accent transition-colors">Sci-Fi Anime</Link>
            </div>
          </div>
        </div>

        {/* A-Z List Section */}
        <div className="mb-12 p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
            <h3 className="text-white/80 font-bold text-lg shrink-0">A-Z List</h3>
            <p className="text-sm text-white/50">Search anime order by alphabet name A to Z.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/az-list" 
              className="px-3 py-1.5 rounded text-sm font-bold bg-white/5 hover:bg-white/10 hover:text-white text-white/70 transition-colors"
            >
              All
            </Link>
            <Link 
              to="/az-list/other" 
              className="px-3 py-1.5 rounded text-sm font-bold bg-white/5 hover:bg-white/10 hover:text-white text-white/70 transition-colors"
            >
              #
            </Link>
            {LETTERS.map(l => (
              <Link 
                key={l}
                to={`/az-list/${l}`}
                className="px-3 py-1.5 rounded text-sm font-bold bg-white/5 hover:bg-white/10 hover:text-white text-white/70 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <div className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} ANIMXER. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link to="/terms" className="hover:text-white/80 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link to="/dmca" className="hover:text-white/80 transition-colors">DMCA</Link>
            <Link to="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

