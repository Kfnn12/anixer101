import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { Anime } from '../lib/api';

interface Props {
  anime: Anime;
}

const AnimeCard: React.FC<Props> = ({ anime }) => {
  return (
    <div className="relative group anime-card-hover rounded-xl overflow-hidden glass-panel">
      <Link to={`/anime/${anime.id}`} className="block relative aspect-[2/3] overflow-hidden">
        <img
          src={anime.poster}
          alt={anime.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-tb from-transparent via-black/20 to-black/90 opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-transform duration-300 transform scale-75 group-hover:scale-100">
          <PlayCircle className="w-12 h-12 text-accent" />
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          {anime.episodes?.sub != null && (
            <span className="bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
              SP {anime.episodes.sub}
            </span>
          )}
          {anime.episodes?.dub != null && anime.episodes.dub > 0 && (
            <span className="bg-accent/20 text-accent border border-accent/30 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
              DUB {anime.episodes.dub}
            </span>
          )}
        </div>
        {anime.type && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] font-mono tracking-widest text-white/90 uppercase border border-white/10">
            {anime.type}
          </div>
        )}
      </Link>
      <div className="px-3 md:px-4 py-3 md:py-4">
        <h3 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-accent transition-colors" title={anime.name}>
          {anime.name}
        </h3>
        {anime.duration && (
          <p className="mt-1 text-xs text-white/50 font-mono tracking-wide">{anime.duration}</p>
        )}
      </div>
    </div>
  );
}

export default AnimeCard;
