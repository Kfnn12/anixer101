export const BASE_API_URL = 'https://xerv2.vercel.app';

let PROXY_1 = 'https://animepahe-proxy.mdtahseen7378.workers.dev/proxy/m3u8-proxy?url=';
let PROXY_2 = 'https://animepahe-proxy.mdtahseen7378.workers.dev/m3u8?url=';

try {
  if (import.meta && import.meta.env) {
    if (import.meta.env.VITE_VIDCLOUD_PROXY) PROXY_1 = import.meta.env.VITE_VIDCLOUD_PROXY;
    if (import.meta.env.VITE_VIDSTREAMING_PROXY) PROXY_2 = import.meta.env.VITE_VIDSTREAMING_PROXY;
  }
} catch (e) {}

const M3U8_PROXIES = [PROXY_1, PROXY_2];

let activeProxyIndex = 0;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchFromApi(path: string) {
  const url = `${BASE_API_URL}${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`fetchFromApi Failed: ${url} status ${response.status}`);
      let errorMessage = `API request failed with status: ${response.status}`;
      if (response.status === 404) errorMessage = "The requested content could not be found.";
      else if (response.status === 429) errorMessage = "You are making too many requests. Please slow down and try again later.";
      else if (response.status >= 500) errorMessage = "The server is currently experiencing issues. Please try again later.";
      throw new ApiError(response.status, errorMessage);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`Network error: ${url}`, error);
    throw new Error(error instanceof Error ? error.message : "Network problem. Please check your connection.");
  }
}

export function getM3U8ProxyUrl(url: string, _referer?: string) {
  return `${M3U8_PROXIES[activeProxyIndex]}${encodeURIComponent(url)}`;
}

export function switchToNextProxy() {
  activeProxyIndex = (activeProxyIndex + 1) % M3U8_PROXIES.length;
  return activeProxyIndex;
}

// Map anime data from new AnimeKai structure to the internal Anime/SpotlightAnime structures
function normalizeAnime(anime: any): Anime {
  return {
    id: anime.id,
    name: anime.title || anime.name,
    jname: anime.jname || anime.romaji,
    poster: anime.poster || anime.posterImage,
    rating: anime.rating || anime.quality,
    episodes: anime.episodes,
    type: anime.type || anime.format,
    duration: anime.duration,
  };
}

function normalizeSpotlightAnime(anime: any): SpotlightAnime {
  return {
    ...normalizeAnime(anime),
    rank: anime.rank || 1,
    description: anime.description || anime.synopsis || '',
    otherInfo: [anime.type, anime.releaseYear?.toString(), anime.quality].filter(Boolean) as string[],
  };
}

// Home mapping via /api/v2/animekai/home
export async function getHome(): Promise<HomeData> {
  const raw = await fetchFromApi('/api/v2/animekai/home');
  const d = raw.data || {};

  return {
    spotlightAnimes: (d.featuredAnimes || []).map(normalizeSpotlightAnime),
    trendingAnimes: (d.topTrending?.now || []).map(normalizeAnime),
    latestEpisodeAnimes: (d.latestUpdates?.all || []).map(normalizeAnime),
    topUpcomingAnimes: (d.quickLists?.upcoming || []).map(normalizeAnime),
    top10Animes: {
      today: (d.topTrending?.now || []).map(normalizeAnime),
      week: (d.topTrending?.week || []).map(normalizeAnime),
      month: (d.topTrending?.month || []).map(normalizeAnime),
    },
    topAiringAnimes: (d.quickLists?.newReleases || []).map(normalizeAnime),
    mostPopularAnimes: (d.topTrending?.month || []).map(normalizeAnime),
    mostFavoriteAnimes: (d.topTrending?.week || []).map(normalizeAnime),
    latestCompletedAnimes: (d.quickLists?.completed || []).map(normalizeAnime),
    recentlyAddedAnimes: (d.quickLists?.newReleases || []).map(normalizeAnime),
    genres: [],
  };
}

// Search
export async function searchAnime(query: string, page = 1) {
  const raw = await fetchFromApi(`/api/v2/animekai/search?q=${encodeURIComponent(query)}&page=${page}`);
  const d = raw.data || raw;
  return {
    animes: (d.animes || d.data || []).map(normalizeAnime),
    currentPage: d.currentPage || page,
    hasNextPage: d.hasNextPage || false,
    totalPages: d.totalPages || d.lastPage || 1,
  };
}

// The rest of the routes may need small mapping adjustments or fallbacks if they don't exist
// Suggestions
export async function getSuggestions(query: string) {
  const raw = await fetchFromApi(`/api/v2/animekai/search/suggestion?q=${encodeURIComponent(query)}`);
  const d = raw.data || raw;
  return {
    suggestions: (d.suggestions || d.animes || d.data || []).map(normalizeAnime),
  };
}

// Shared list fetcher for category/recent/genre/etc
async function fetchList(path: string, page = 1) {
  try {
    const raw = await fetchFromApi(path);
    const d = raw.data || raw;
    return {
      animes: (d.animes || d.data || []).map(normalizeAnime),
      currentPage: d.currentPage || page,
      hasNextPage: d.hasNextPage || false,
      totalPages: d.totalPages || d.lastPage || 1,
    };
  } catch(e) {
    return { animes: [], currentPage: 1, hasNextPage: false, totalPages: 1 };
  }
}

export async function getCategory(category: string, page = 1) { return fetchList(`/api/v2/animekai/category/${category}?page=${page}`, page); }
export async function getRecent(status: string, page = 1) { return fetchList(`/api/v2/animekai/category/${status}?page=${page}`, page); }
export async function getGenre(genre: string, page = 1) { return fetchList(`/api/v2/animekai/genre/${genre}?page=${page}`, page); }
export async function getFormat(format: string, page = 1) { return fetchList(`/api/v2/animekai/category/${format}?page=${page}`, page); }
export async function getAZList(sort: string, page = 1) { return fetchList(`/api/v2/animekai/azlist/${sort}?page=${page}`, page); }

// Details
export async function getAnimeDetails(id: string): Promise<AnimeDetails> {
  const raw = await fetchFromApi(`/api/v2/animekai/anime/${id}`);
  const data = raw.data || raw;
  
  return {
    anime: {
      info: {
        id: data.id || id,
        name: data.title || data.name,
        poster: data.poster || data.posterImage,
        description: data.description || data.synopsis || '',
        malId: data.externalLinks?.mal ? data.externalLinks.mal.split('/').filter(Boolean).pop() : undefined,
        anilistId: data.externalLinks?.anilist ? data.externalLinks.anilist.split('/').filter(Boolean).pop() : undefined,
        stats: {
          rating: data.rating,
          quality: data.quality || 'HD',
          episodes: data.episodes || { sub: 0, dub: 0 },
          type: data.format || data.type,
          duration: data.details?.duration || '',
        },
        promotionalVideos: [], // Not primarily supported by this wrapper endpoint directly unless in externalLinks etc
        charactersVoiceActors: [], // Characters not strictly in standard animekai details yet
      },
      moreInfo: {
        japanese: data.jname || data.details?.japanese,
        synonyms: data.altTitle,
        aired: data.details?.aired,
        premiered: data.details?.premiered,
        duration: data.details?.duration,
        status: data.details?.status,
        malscore: data.details?.malScore,
        genres: data.genres,
        studios: data.details?.studios,
        producers: (data.details?.producers?.split(',') || []).map((s:string) => s.trim()),
      },
    },
    seasons: (data.relations || []).map((s: any) => ({
      id: s.id,
      name: s.title,
      title: s.title,
      poster: s.poster,
      isCurrent: s.id === id,
    })),
    mostPopularAnimes: [],
    relatedAnimes: (data.relations || []).map(normalizeAnime),
    recommendedAnimes: (data.recommendations || []).map(normalizeAnime),
  };
}

// Episodes
export async function getAnimeEpisodes(id: string): Promise<EpisodeData> {
  const raw = await fetchFromApi(`/api/v2/animekai/anime/${id}/episodes`);
  const data = raw.data || raw;
  const episodesData = data.episodes || [];
  
  return {
    totalEpisodes: data.totalEpisodes || episodesData.length,
    episodes: episodesData.map((ep: any) => ({
      title: ep.title || `Episode ${ep.number}`,
      episodeId: ep.episodeId,
      number: ep.number,
      isFiller: ep.isFiller || false,
      hasSub: ep.hasSub,
      hasDub: ep.hasDub,
    })),
  };
}

// Servers
export async function getEpisodeServers(episodeId: string): Promise<ServersData> {
  const raw = await fetchFromApi(`/api/v2/animekai/episode/servers?animeEpisodeId=${episodeId}`);
  const c = raw.data?.categories || {};
  
  return {
    sub: (c.sub || []).map((s: any) => ({
      serverId: String(s.serverId),
      serverName: s.serverName,
    })),
    dub: (c.dub || []).map((s: any) => ({
      serverId: String(s.serverId),
      serverName: s.serverName,
    })),
    raw: (c.raw || c.softsub || []).map((s: any) => ({
      serverId: String(s.serverId),
      serverName: s.serverName,
    })),
    episodeId,
    episodeNo: raw.data?.episode || 1,
  };
}

// Sources
export async function getEpisodeSources(episodeId: string, version = 'sub', server = 'server-1'): Promise<SourcesData> {
  // Try to extract original base episode string from 'id:version:server' format if needed
  // But animeEpisodeId is what is required
  const raw = await fetchFromApi(`/api/v2/animekai/episode/sources?animeEpisodeId=${episodeId}&ep=0&server=${server}&category=${version}`);
  const data = raw.data || raw;
  
  return {
    referer: data.sources?.[0]?.referer || '',
    sources: (data.sources || []).map((s: any) => ({
      url: s.url || s.source || s.file,
      type: s.type || (s.isM3u8 ? 'hls' : 'hls'),
    })),
    subtitles: (data.subtitles || data.tracks || []).map((s: any) => ({
      file: s.file || s.url || '',
      label: s.label || s.lang || 'Unknown',
      kind: s.kind || 'captions',
      default: s.default || false,
    })),
    intro: data.intro ? { start: data.intro[0], end: data.intro[1] } : undefined,
    outro: data.outro ? { start: data.outro[0], end: data.outro[1] } : undefined,
  };
}

// Normalized types
export interface Anime {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  rating?: string;
  episodes?: {
    sub?: number;
    dub?: number;
  };
  type?: string;
  duration?: string;
}

export interface SpotlightAnime extends Anime {
  rank: number;
  description: string;
  otherInfo?: string[];
}

export interface HomeData {
  spotlightAnimes: SpotlightAnime[];
  trendingAnimes: Anime[];
  latestEpisodeAnimes: Anime[];
  topUpcomingAnimes: Anime[];
  top10Animes: {
    today: Anime[];
    week: Anime[];
    month: Anime[];
  };
  topAiringAnimes: Anime[];
  mostPopularAnimes: Anime[];
  mostFavoriteAnimes: Anime[];
  latestCompletedAnimes: Anime[];
  recentlyAddedAnimes: Anime[];
  genres: string[];
}

export interface AnimeDetails {
  anime: {
    info: {
      id: string;
      name: string;
      poster: string;
      description: string;
      malId?: string;
      anilistId?: string;
      stats: {
        rating?: string;
        quality?: string;
        episodes: { sub: number; dub: number };
        type?: string;
        duration?: string;
      };
      promotionalVideos?: { title: string; source: string; thumbnail: string }[];
      charactersVoiceActors?: { character: { id: string; poster: string; name: string; cast: string }; voiceActor: { id: string; poster: string; name: string; cast: string } | null }[];
    };
    moreInfo: {
      japanese?: string;
      synonyms?: string;
      aired?: string;
      premiered?: string;
      duration?: string;
      status?: string;
      malscore?: string;
      genres?: string[];
      studios?: string;
      producers?: string[];
    };
  };
  seasons?: { id: string; name: string; title: string; poster: string; isCurrent: boolean }[];
  mostPopularAnimes?: Anime[];
  relatedAnimes?: Anime[];
  recommendedAnimes?: Anime[];
}

export interface Episode {
  title: string;
  episodeId: string;
  number: number;
  isFiller: boolean;
  hasSub?: boolean;
  hasDub?: boolean;
}

export interface EpisodeData {
  totalEpisodes: number;
  episodes: Episode[];
}

export interface Server {
  serverName: string;
  serverId: string;
}

export interface ServersData {
  sub: Server[];
  dub: Server[];
  raw: Server[];
  episodeId: string;
  episodeNo: number;
}

export interface Source {
  url: string;
  type: string;
}

export interface Subtitle {
  file: string;
  label: string;
  kind: string;
  default?: boolean;
}

export interface SourcesData {
  sources: Source[];
  subtitles: Subtitle[];
  referer?: string;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  episode: number;
  url: string;
}

export async function getSchedule(date: string): Promise<ScheduleItem[]> {
  const raw = await fetchFromApi(`/api/v2/animekai/schedule?date=${date}`);
  return raw.schedule || [];
}
