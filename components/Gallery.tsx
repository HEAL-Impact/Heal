'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Linkedin, X } from 'lucide-react';
import { GALLERY_PHOTOS, GALLERY_VIDEOS, photoSrc, thumbSrc } from '@/lib/gallery';
import { HEAL_LINKEDIN_URL } from '@/lib/social';

const INITIAL_COUNT = 10; // two rows of five
type Tab = 'images' | 'videos';

function TabButtons({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <div className="flex justify-center gap-3" role="group" aria-label="Choose images or videos">
      {(['images', 'videos'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          aria-pressed={tab === t}
          className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === t
              ? 'bg-[#044750] text-white'
              : 'bg-[#044750]/10 text-[#044750] hover:bg-[#044750]/20'
          }`}
        >
          See {t}
        </button>
      ))}
    </div>
  );
}

export default function Gallery() {
  const [tab, setTab] = useState<Tab>('images');
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = showAll ? GALLERY_PHOTOS : GALLERY_PHOTOS.slice(0, INITIAL_COUNT);
  const total = GALLERY_PHOTOS.length;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + total) % total : null)),
    [total]
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % total : null)),
    [total]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const active = lightboxIndex !== null ? GALLERY_PHOTOS[lightboxIndex] : null;

  return (
    <section className="py-12 sm:py-20 bg-[#FEF5E3]" aria-labelledby="gallery-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          id="gallery-heading"
          className="text-center text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#044750] font-acme mb-6"
        >
          Our Gallery
        </h2>

        <TabButtons tab={tab} onChange={setTab} />

        {tab === 'images' ? (
          <>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.name}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-[#044750]/40"
                  aria-label={`View larger: ${photo.caption}`}
                >
                  <Image
                    src={thumbSrc(photo)}
                    alt={photo.caption}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-left text-xs sm:text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {photo.caption}
                  </span>
                </button>
              ))}
            </div>

            {total > INITIAL_COUNT && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="rounded-md bg-[#044750] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#275960] transition-colors"
                >
                  {showAll ? 'Show fewer images' : `See all ${total} images`}
                </button>
              </div>
            )}
          </>
        ) : GALLERY_VIDEOS.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {GALLERY_VIDEOS.map((video) => (
              <figure key={video.src} className="overflow-hidden rounded-xl bg-black shadow-md">
                <video src={video.src} controls preload="metadata" className="aspect-video w-full" />
                <figcaption className="bg-white px-4 py-3 text-sm text-[#044750]">{video.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-xl bg-white/70 px-6 py-12 text-center shadow-sm">
            <p className="text-[#044750] font-acme text-xl mb-2">Videos are on their way</p>
            <p className="text-[#044750]/70 mb-6">Meanwhile, catch our latest stories and clips on LinkedIn.</p>
            <a
              href={HEAL_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#044750] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#275960] transition-colors"
            >
              <Linkedin className="w-4 h-4" aria-hidden="true" />
              Watch on LinkedIn
            </a>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/25 transition-colors"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            className="absolute left-2 sm:left-4 z-10 text-white bg-white/10 rounded-full p-2 hover:bg-white/25 transition-colors"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <figure className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-[92vw] max-w-5xl h-[75vh]">
              <Image src={photoSrc(active)} alt={active.caption} fill sizes="92vw" className="object-contain" />
            </div>
            <figcaption className="text-center text-white/90 px-6">
              <span className="block text-xs uppercase tracking-wider text-white/60 mb-1">
                {lightboxIndex + 1} / {total}
              </span>
              {active.caption}
            </figcaption>
          </figure>

          <button
            className="absolute right-2 sm:right-4 z-10 text-white bg-white/10 rounded-full p-2 hover:bg-white/25 transition-colors"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </section>
  );
}
