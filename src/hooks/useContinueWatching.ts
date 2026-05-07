import { useState, useEffect } from 'react';

export interface WatchProgress {
  animeId: string;
  animeTitle: string;
  poster: string;
  episodeId: string;
  episodeNumber: number;
  progress: number;
  duration: number;
  updatedAt: number;
}

export function useContinueWatching() {
  const [history, setHistory] = useState<WatchProgress[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('watchHistory');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse watch history', err);
    }
  }, []);

  const saveProgress = (progress: Omit<WatchProgress, 'updatedAt'>) => {
    try {
      const stored = localStorage.getItem('watchHistory');
      let currentHistory: WatchProgress[] = stored ? JSON.parse(stored) : [];

      const index = currentHistory.findIndex(h => h.animeId === progress.animeId);
      
      const newEntry: WatchProgress = {
        ...progress,
        updatedAt: Date.now()
      };

      if (index !== -1) {
        currentHistory[index] = newEntry;
      } else {
        currentHistory.unshift(newEntry);
      }

      // Sort by recently updated
      currentHistory.sort((a, b) => b.updatedAt - a.updatedAt);
      
      // Limit to 50 items
      currentHistory = currentHistory.slice(0, 50);

      localStorage.setItem('watchHistory', JSON.stringify(currentHistory));
      setHistory(currentHistory);
    } catch (err) {
      console.error('Failed to save watch history', err);
    }
  };
  
  const getProgress = (animeId: string) => {
    return history.find(h => h.animeId === animeId) || null;
  };
  
  const getEpisodeProgress = (episodeId: string) => {
    return history.find(h => h.episodeId === episodeId) || null;
  };

  const removeProgress = (animeId: string) => {
    try {
      const updatedHistory = history.filter(h => h.animeId !== animeId);
      localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Failed to remove watch history', err);
    }
  };

  return { history, saveProgress, getProgress, getEpisodeProgress, removeProgress };
}
