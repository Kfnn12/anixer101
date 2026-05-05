// @ts-nocheck
(globalThis as any).import = { meta: { env: { VITE_API_URL: 'https://xerv2.vercel.app', VITE_VIDCLOUD_PROXY: '', VITE_VIDSTREAMING_PROXY: '' } } };
import { getHome, searchAnime, getSuggestions, getCategory, getRecent, getGenre, getFormat, getAZList, getAnimeDetails, getAnimeEpisodes, getEpisodeServers, getEpisodeSources } from './src/lib/api.ts';

const tests = [
  { name: 'getHome', fn: () => getHome() },
  { name: 'searchAnime', fn: () => searchAnime('one piece') },
  { name: 'getSuggestions', fn: () => getSuggestions('one piece') },
  { name: 'getCategory', fn: () => getCategory('subbed') },
  { name: 'getRecent', fn: () => getRecent('recently-updated') },
  { name: 'getGenre', fn: () => getGenre('action') },
  { name: 'getFormat', fn: () => getFormat('tv') },
  { name: 'getAZList', fn: () => getAZList('0-9') },
  { name: 'getAnimeDetails', fn: () => getAnimeDetails('one-piece-dk6r') },
  { name: 'getAnimeEpisodes', fn: () => getAnimeEpisodes('one-piece-dk6r') },
  { name: 'getEpisodeServers', fn: () => getEpisodeServers('one-piece-dk6r?ep=1') },
  { name: 'getEpisodeSources', fn: () => getEpisodeSources('one-piece-dk6r?ep=1') }
];

async function run() {
  for (const t of tests) {
    try {
      await t.fn();
      console.log('OK: ' + t.name);
    } catch(e: any) {
      console.error('FAIL: ' + t.name, e.message);
    }
  }
}
run();
