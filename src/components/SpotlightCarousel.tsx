import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { SpotlightAnime } from '../lib/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    z: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    z: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  })
};

export default function SpotlightCarousel({ items }: { items: SpotlightAnime[] }) {
  const [[page, direction], setPage] = useState([0, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(timer);
  }, [page, items.length]);

  if (!items || items.length === 0) return null;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const setIndex = (index: number) => {
    let diff = index - (page % items.length);
    if (page % items.length < 0) {
      diff = index - ((page % items.length) + items.length);
    }
    setPage([page + diff, diff > 0 ? 1 : -1]);
  };

  // Wrap index to deal with negative page numbers if moving backwards constantly
  const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };
  
  const currentIndex = wrap(0, items.length, page);
  const current = items[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-[var(--color-card)]">
      {/* Background Image Setup */}
      {items.map((item, index) => (
        <div
          key={`bg-${item.id}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img
            src={item.poster}
            alt={item.name}
            className="w-full h-full object-cover object-center blur-xl scale-105 opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)] to-transparent" />
        </div>
      ))}

      {/* Content */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.4 }
          }}
          className="absolute inset-0 z-20 flex items-center"
        >
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-accent font-bold text-sm tracking-wide">#{current.rank} Spotlight</span>
                {current.type && <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] border border-white/10 uppercase">{current.type}</span>}
                {current.duration && <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] border border-white/10">{current.duration}</span>}
                <span className="bg-accent text-black font-bold px-2 py-0.5 rounded text-[10px]">HD</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white drop-shadow-2xl">
                {current.name}
              </h1>
              
              <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3 max-w-2xl hidden sm:block">
                {current.description}
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link
                  to={`/anime/${current.id}`}
                  className="bg-accent hover:bg-white text-black px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </Link>
                <Link
                  to={`/anime/${current.id}`}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-end pr-8 xl:pr-12">
               <div className="relative w-2/3 max-w-md aspect-[2/3] rounded-2xl overflow-hidden glass-panel rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                  <img 
                    src={current.poster} 
                    alt={current.name}
                    className="w-full h-full object-cover" 
                  />
               </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Indicators */}
      <div className="absolute right-4 md:right-12 bottom-12 z-30 flex flex-col gap-3">
        <div className="flex gap-2">
          <button 
            onClick={() => paginate(-1)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => paginate(1)}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 hover:text-accent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={cn(
                "h-1 transition-all rounded-full",
                idx === currentIndex ? "w-8 bg-accent" : "w-1.5 bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
