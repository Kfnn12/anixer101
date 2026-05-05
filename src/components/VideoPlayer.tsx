import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { SourcesData, getM3U8ProxyUrl } from '../lib/api';

import { AlertTriangle, RefreshCw, Server } from 'lucide-react';

interface VideoPlayerProps {
  sourcesData: SourcesData;
  onEnded?: () => void;
}

export default function VideoPlayer({ sourcesData, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const defaultSource = sourcesData.sources.find(s => s.type === 'hls' || s.type === 'iframe') || sourcesData.sources[0];
  const isIframe = defaultSource?.type === 'iframe' || (defaultSource?.url && !defaultSource.url.includes('.m3u8') && !defaultSource.url.includes('.mp4'));

  useEffect(() => {
    setError(null);
    if (!defaultSource) {
      setError('No playable source found.');
      return;
    }

    if (isIframe) {
      // Nothing needed for iframe rendering logic here
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const originalUrl = defaultSource.url;
    // Apply proxy to m3u8 url to bypass CORS issues
    const url = (defaultSource.type === 'hls' || originalUrl.includes('.m3u8')) 
      ? getM3U8ProxyUrl(originalUrl) 
      : originalUrl;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR || data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                setError(`Manifest load error: Stream might be unavailable or blocked. (${data.details})`);
              } else {
                setError(`Network error: ${data.details}`);
              }
              hls?.destroy(); // stop automatic retry, use user manual retry via button
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError(`Media playback error: ${data.details}`);
              hls?.destroy(); // or could try `hls?.recoverMediaError()` but requirements say show retry button
              break;
            case Hls.ErrorTypes.KEY_SYSTEM_ERROR:
              setError(`DRM error: ${data.details}`);
              hls?.destroy();
              break;
            default:
              hls?.destroy();
              setError(`Fatal video error: ${data.details || 'Unknown'}`);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari native HLS
      video.src = url;
    } else {
      setError('HLS is not supported in this browser.');
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [sourcesData, defaultSource, isIframe, retryCount]);

  return (
    <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-2xl glass-panel">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 bg-black/90 backdrop-blur-md">
          <div className="bg-white/[0.03] rounded-2xl p-8 text-center border border-white/10 max-w-lg w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
               <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Oops! Playback Issue</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              We encountered a problem while trying to play this video. 
              <span className="block mt-2 px-3 py-2 bg-black/40 rounded-lg text-red-400 font-mono text-xs text-left overflow-hidden text-ellipsis">
                {error}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex-1 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
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
        <video
          ref={videoRef}
          controls
          className="w-full h-full relative z-0"
          crossOrigin="anonymous" // required for subtitles sometimes
          poster={sourcesData.intro ? undefined : undefined} // Not provided in source directly, but usually we have it on page
          onEnded={onEnded}
          onError={(e) => {
            const mediaError = (e.target as HTMLVideoElement).error;
            if (mediaError) {
              const errorMessage = {
                1: 'Playback aborted.',
                2: 'Network error.',
                3: 'Media decoding failed.',
                4: 'Format not supported or media unavailable.',
              }[mediaError.code] || 'Unknown media error.';
              
              if (!error) {
                setError(`Video Error: ${errorMessage}`);
              }
            }
          }}
        >
          {sourcesData.subtitles?.map((sub, idx) => (
            <track
              key={idx}
              kind={sub.kind || "captions"}
              label={sub.label}
              src={sub.file}
              srcLang={sub.label.substring(0, 2).toLowerCase()}
              default={sub.default || sub.label.includes('English')}
            />
          ))}
          Your browser does not support HTML5 video.
        </video>
      )}
    </div>
  );
}
