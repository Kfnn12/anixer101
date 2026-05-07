import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import Artplayer from 'artplayer';
import { SourcesData, getM3U8ProxyUrl } from '../lib/api';

import { AlertTriangle, RefreshCw, Server } from 'lucide-react';

interface VideoPlayerProps {
  sourcesData: SourcesData;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  startTime?: number;
}

export default function VideoPlayer({ sourcesData, onEnded, onProgress, startTime }: VideoPlayerProps) {
  const artRef = useRef<HTMLDivElement>(null);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; suggestion: string; canRetry: boolean } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const defaultSource = sourcesData.sources.find(s => s.type === 'hls' || s.type === 'iframe') || sourcesData.sources[0];
  const isIframe = defaultSource?.type === 'iframe' || (defaultSource?.url && !defaultSource.url.includes('.m3u8') && !defaultSource.url.includes('.mp4'));

  useEffect(() => {
    setErrorInfo(null);
    if (!defaultSource) {
      setErrorInfo({
        title: 'No Playable Source',
        message: 'We could not find a supported video source for this episode.',
        suggestion: 'Please try selecting a different server from the options below.',
        canRetry: false
      });
      return;
    }

    if (isIframe) {
      return;
    }

    if (!artRef.current) return;

    let hls: Hls | null = null;
    const originalUrl = defaultSource.url;
    // Apply proxy to m3u8 url to bypass CORS issues if needed
    const url = (defaultSource.type === 'hls' || originalUrl.includes('.m3u8')) 
      ? getM3U8ProxyUrl(originalUrl) 
      : originalUrl;

    const isM3U8 = url.includes('.m3u8');

    // Find a default subtitle (English if available)
    const defaultSub = sourcesData.subtitles?.find(s => s.default || s.label.toLowerCase().includes('english')) || sourcesData.subtitles?.[0];

    const art = new Artplayer({
      container: artRef.current,
      url: url,
      type: isM3U8 ? 'm3u8' : 'mp4',
      theme: '#E11D48', // matches accent color
      fullscreen: true,
      fullscreenWeb: true,
      playsInline: true,
      playbackRate: true,
      setting: true,
      hotkey: true, // perfect for Android TV remotes (Enter, Arrows) & PC
      pip: true,
      autoSize: false,
      autoMini: true,
      subtitleOffset: true,
      subtitle: defaultSub ? {
        url: defaultSub.file,
        type: 'vtt',
        style: {
          color: '#ffffff',
          fontSize: '20px',
          textShadow: '1px 1px 4px #000',
        },
        encoding: 'utf-8',
      } : undefined,
      customType: {
        m3u8: function (video, url, artObj) {
          if (Hls.isSupported()) {
            if (hls) hls.destroy();
            hls = new Hls({
              maxBufferLength: 30,
              enableWorker: true,
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                 let suggestion = 'Please try selecting a different server.';
                 let title = 'Playback Error';
                 let message = `Failed to load video (${data.details}).`;
                 let canRetry = true;
                 
                 switch (data.type) {
                   case Hls.ErrorTypes.NETWORK_ERROR:
                     title = 'Network Error';
                     if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                       suggestion = 'The video stream is unavailable or blocked. Try a different server or disable your adblocker.';
                     } else if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                       suggestion = 'Connection timed out while loading the video manifest. Please check your internet connection.';
                     } else if (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR || data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT) {
                       suggestion = 'Connection interrupted while downloading video segments. Please check your network stability.';
                     } else if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
                       suggestion = 'The video manifest format is not supported or corrupted. Please switch to another server.';
                       canRetry = false;
                     } else {
                       suggestion = 'A network error occurred. Check your internet connection and try again.';
                     }
                     break;
                     
                   case Hls.ErrorTypes.MEDIA_ERROR:
                     title = 'Media Decoding Error';
                     if (data.details === Hls.ErrorDetails.BUFFER_APPEND_ERROR || data.details === Hls.ErrorDetails.BUFFER_APPENDING_ERROR) {
                       suggestion = 'Your device encountered an issue buffering the video. Try refreshing the page.';
                     } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                       suggestion = 'Video buffering stalled. Your connection might be too slow for this quality.';
                     } else {
                       suggestion = 'The video player encountered a decoding issue. Try reloading or changing the server.';
                     }
                     break;
                     
                   case Hls.ErrorTypes.MUX_ERROR:
                     title = 'Format Muxing Error';
                     suggestion = 'The video format could not be processed properly by the browser. Try another server.';
                     canRetry = false;
                     break;
                     
                   case Hls.ErrorTypes.KEY_SYSTEM_ERROR:
                     title = 'DRM/Decryption Error';
                     suggestion = 'The video could not be decrypted. This content might be restricted or unsupported on your device.';
                     canRetry = false;
                     break;
                     
                   default:
                     title = 'Unexpected Error';
                     suggestion = 'An unknown playback issue occurred. Please try a different server.';
                     break;
                 }

                 setErrorInfo({
                   title,
                   message,
                   suggestion,
                   canRetry
                 });
                 hls?.destroy();
              }
            });

          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else {
            setErrorInfo({
              title: 'Browser Unsupported',
              message: 'Your browser does not support HLS playback.',
              suggestion: 'Please try using a modern browser like Chrome, Firefox, or Safari.',
              canRetry: false
            });
          }
        },
      },
    });

    if (onEnded) {
      art.on('video:ended', onEnded);
    }
    
    if (onProgress) {
      art.on('video:timeupdate', () => {
        if (art.video && art.duration) {
          onProgress(art.currentTime, art.duration);
        }
      });
    }

    if (startTime) {
      art.on('ready', () => {
        if (art.video) {
          art.video.currentTime = startTime;
        }
      });
    }
    
    art.on('video:error', (e) => {
      const errorMsg = 'An unexpected video error occurred.';
      if (!errorInfo) {
        setErrorInfo({
          title: 'Video Error',
          message: errorMsg,
          suggestion: 'Please try selecting a different server.',
          canRetry: true
        });
      }
    });

    return () => {
      if (hls) hls.destroy();
      if (art && art.destroy) art.destroy(false);
    };
  }, [sourcesData, defaultSource, isIframe, retryCount]);

  return (
    <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-2xl glass-panel">
      {errorInfo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 bg-black/90 backdrop-blur-md">
          <div className="bg-white/[0.03] rounded-2xl p-8 text-center border border-white/10 max-w-lg w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
               <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{errorInfo.title}</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              {errorInfo.message}
              <span className="block mt-2 px-3 py-2 bg-black/40 rounded-lg text-accent font-medium text-xs text-center overflow-hidden text-ellipsis">
                {errorInfo.suggestion}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {errorInfo.canRetry && (
                <button
                  onClick={() => setRetryCount(c => c + 1)}
                  className="flex-1 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
              )}
              <div className="relative flex-1 group">
                <button
                  className="w-full px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Server size={18} />
                  Change Server
                </button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 min-w-max px-3 py-2 bg-black/90 text-xs text-white/80 rounded border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
                  Select a different server below the player
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isIframe ? (
        <iframe
          src={defaultSource.url}
          className="w-full h-full border-0 absolute top-0 left-0"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      ) : (
        <div ref={artRef} className="w-full h-full relative z-0 artplayer-app" />
      )}
    </div>
  );
}
