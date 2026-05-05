import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { SourcesData, getM3U8ProxyUrl } from '../lib/api';

interface VideoPlayerProps {
  sourcesData: SourcesData;
}

export default function VideoPlayer({ sourcesData }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultSource = sourcesData.sources.find(s => s.type === 'hls' || s.type === 'iframe') || sourcesData.sources[0];
  const isIframe = defaultSource?.type === 'iframe' || (defaultSource?.url && !defaultSource.url.includes('.m3u8') && !defaultSource.url.includes('.mp4'));

  useEffect(() => {
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
                setError(`Network error: Failed to load manifest. Stream might be unavailable.`);
              } else {
                setError(`Network error: ${data.details}. Attempting recovery...`);
              }
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError(`Media error: ${data.details}. Attempting recovery...`);
              hls?.recoverMediaError();
              break;
            case Hls.ErrorTypes.KEY_SYSTEM_ERROR:
              setError(`DRM/Key System error: ${data.details}.`);
              break;
            default:
              hls?.destroy();
              setError(`Fatal video error: ${data.details || 'Unknown'}.`);
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
  }, [sourcesData, defaultSource, isIframe]);

  return (
    <div className="w-full aspect-video bg-black relative rounded-xl overflow-hidden shadow-2xl glass-panel">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
          <div className="bg-black/60 rounded-lg p-4 text-center">
             <p className="text-red-400 font-mono text-sm">{error}</p>
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
