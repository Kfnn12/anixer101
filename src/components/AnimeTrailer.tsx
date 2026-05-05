import { useState, useEffect } from 'react';

interface Trailer {
  title: string;
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
    images: {
      image_url: string | null;
      small_image_url: string | null;
      medium_image_url: string | null;
      large_image_url: string | null;
      maximum_image_url: string | null;
    };
  };
}

export default function AnimeTrailer({ malId }: { malId: string }) {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrailers() {
      if (!malId) return;
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}/videos`);
        const data = await response.json();
        if (data && data.data && data.data.promo) {
          setTrailers(data.data.promo);
        }
      } catch (err) {
        console.error("Failed to load trailers", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrailers();
  }, [malId]);

  if (!malId || (loading && trailers.length === 0)) return null;
  if (trailers.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black text-white mb-6">Trailers & PVs</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
        {trailers.map((promo, idx) => (
          promo.trailer.embed_url ? (
            <div key={idx} className="min-w-[300px] md:min-w-[400px] aspect-video rounded-xl overflow-hidden bg-white/5 snap-center relative border border-white/10 group">
              <iframe
                src={promo.trailer.embed_url.replace('autoplay=1', 'autoplay=0')}
                title={promo.title}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          ) : null
        ))}
      </div>
    </section>
  );
}
