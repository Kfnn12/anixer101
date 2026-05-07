import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAnime, getGenre, getFormat, ApiError } from '../lib/api';
import AnimeCard from '../components/AnimeCard';
import ErrorState from '../components/ErrorState';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';

const GENRES = ["Action", "Adventure", "Cars", "Comedy", "Dementia", "Demons", "Drama", "Ecchi", "Fantasy", "Game", "Harem", "Historical", "Horror", "Isekai", "Josei", "Kids", "Magic", "Martial Arts", "Mecha", "Military", "Music", "Mystery", "Parody", "Police", "Psychological", "Romance", "Samurai", "School", "Sci-Fi", "Seinen", "Shoujo", "Shoujo Ai", "Shounen", "Shounen Ai", "Slice of Life", "Space", "Sports", "Super Power", "Vampire", "Yaoi", "Yuri"];
const TYPES = ["tv", "movie", "ova", "ona", "special"];
const SORTS = ["relevance", "rating", "name-asc", "name-desc"];
const YEARS = Array.from({length: new Date().getFullYear() - 1989}, (_, i) => String(new Date().getFullYear() - i));

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';
  const initialType = searchParams.get('type') || '';
  const initialSort = searchParams.get('sort') || 'relevance';
  const initialYear = searchParams.get('year') || '';

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);
  const [type, setType] = useState(initialType);
  const [sort, setSort] = useState(initialSort);
  const [year, setYear] = useState(initialYear);

  const [showFilters, setShowFilters] = useState(false);
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (queryInput) params.q = queryInput;
    if (genre) params.genre = genre;
    if (type) params.type = type;
    if (sort !== 'relevance') params.sort = sort;
    if (year) params.year = year;
    setSearchParams(params);
    setQuery(queryInput);
  };

  const handleClear = () => {
    setQueryInput('');
    setGenre('');
    setType('');
    setSort('relevance');
    setYear('');
    setSearchParams({});
    setQuery('');
  };

  const doSearch = async () => {
    if (!query && !genre && !type) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      let res;
      // Because the wrapper API lacks advanced combo filters, we prioritize text > genre > format 
      // and do local filtering if multiple are selected.
      if (query) {
        res = await searchAnime(query, 1);
      } else if (genre) {
        res = await getGenre(genre.toLowerCase().replace(/\s+/g, '-'), 1);
      } else if (type) {
        res = await getFormat(type, 1);
      }
      
      let items = res?.animes || [];

      // Local Post-Filtering
      if (type && !(!query && !genre)) {
        items = items.filter((a: any) => a.type?.toLowerCase() === type.toLowerCase());
      }
      
      if (year) {
        // Advanced info is missing in list nodes unless included in otherInfo/description
        // For search endpoint, we approximate or skip if not available, since consumet strips it.
        // We do a soft filter if year happens to exist in other details:
        items = items.filter((a: any) => {
          if (!a.otherInfo) return true; // keep if year data unknown to avoid wiping results
          return a.otherInfo.join(' ').includes(year);
        });
      }

      // Local Sorting
      if (sort === 'rating') {
        items.sort((a: any, b: any) => {
          if (a.rating === b.rating) return 0;
          return (a.rating || '') < (b.rating || '') ? 1 : -1;
        });
      } else if (sort === 'name-asc') {
        items.sort((a: any, b: any) => a.name.localeCompare(b.name));
      } else if (sort === 'name-desc') {
        items.sort((a: any, b: any) => b.name.localeCompare(a.name));
      }

      setResults(items);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) setErrorMsg(err.message);
      else setErrorMsg('Failed to process search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch();
  }, [query, genre, type, sort, year, retryCount]);

  // Sync state if URL changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setQueryInput(q);
    setGenre(searchParams.get('genre') || '');
    setType(searchParams.get('type') || '');
    setSort(searchParams.get('sort') || 'relevance');
    setYear(searchParams.get('year') || '');
  }, [searchParams]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 min-h-[100dvh]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex-1 w-full max-w-2xl">
          <h1 className="text-3xl font-black mb-4">Advanced Search</h1>
          <form 
            onSubmit={(e) => { e.preventDefault(); applyFilters(); }}
            className="flex gap-2 w-full"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-accent transition-colors">
                <SearchIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search anime titles..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:border-accent/50 focus:bg-white/5 transition-all text-white placeholder-white/30"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => { setQueryInput(''); setQuery(''); setSearchParams({}); }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white px-8 hidden sm:flex items-center justify-center rounded-2xl font-bold transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 flex items-center justify-center rounded-2xl border transition-all ${showFilters ? 'bg-white/10 border-white/20 text-white' : 'bg-black/20 border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="bg-[var(--color-surface)] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl shadow-black/20 flex flex-col gap-6">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Genre Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Genre</label>
                  <select 
                    value={genre}
                    onChange={(e) => { setGenre(e.target.value); setTimeout(applyFilters, 0); }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent appearance-none"
                  >
                    <option value="">Any Genre</option>
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => { setType(e.target.value); setTimeout(applyFilters, 0); }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent appearance-none"
                  >
                    <option value="">Any Type</option>
                    {TYPES.map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Release Year</label>
                  <select 
                    value={year}
                    onChange={(e) => { setYear(e.target.value); setTimeout(applyFilters, 0); }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent appearance-none"
                  >
                    <option value="">Any Year</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Sort By</label>
                  <select 
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-accent appearance-none capitalize"
                  >
                    {SORTS.map(s => (
                      <option key={s} value={s}>{s.replace('-', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/5 gap-4">
                <p className="text-sm text-accent/80 font-medium">
                  {query && (genre || year) && "Note: Keyword searches might limit strict genre or year filtering due to API structure."}
                </p>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={handleClear}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                  <button 
                    onClick={applyFilters}
                    className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex items-center justify-between text-white/70 text-sm bg-white/5 py-3 px-6 rounded-2xl border border-white/5">
        <p className="font-medium">
          {(query || genre || type || year) ? (
            <>Results for: <span className="text-white">"{query || [genre, type, year].filter(Boolean).join(' • ')}"</span></>
          ) : (
            <>Use the search bar or filters to find anime</>
          )}
        </p>
        {!loading && <p>Found <span className="text-white font-bold">{results.length}</span> items</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="relative">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-accent"></div>
              <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
           </div>
        </div>
      ) : errorMsg ? (
        <ErrorState message={errorMsg} onRetry={() => setRetryCount(c => c + 1)} className="my-10" />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {results.map((item: any) => (
            <AnimeCard key={item.id} anime={item} />
          ))}
        </div>
      ) : (query || genre || type) ? (
        <div className="text-center py-24 glass-panel rounded-3xl border border-white/5">
          <div className="text-white/20 mb-6 flex justify-center">
            <Filter className="w-20 h-20" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No results found</h3>
          <p className="text-white/50 max-w-sm mx-auto">
            We couldn't find any anime matching your criteria. Try adjusting your filters or search terms.
          </p>
          <button 
            onClick={handleClear}
            className="mt-6 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
