import { useEffect, useRef, useState } from "react";

export const AI_LINE = "Images shown are AI-generated vision of the experience we are working on building.";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function useIsNarrow(maxWidth = 767) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [maxWidth]);
  return narrow;
}

interface AzVideoProps {
  src: string;
  /** VP9 fallback for browsers that cannot play H.264. */
  webm?: string;
  poster: string;
  label: string;
  className?: string;
  /** Show the poster instead of the video on phones (used for the hero). */
  posterOnNarrow?: boolean;
  objectPosition?: string;
  /** Background film: hidden from screen readers. */
  decorative?: boolean;
  /** Above the fold: load the poster right away. */
  eager?: boolean;
}

/**
 * Muted, looping brand film. Plays only while on screen. Respects reduced motion
 * by showing the poster frame instead of the video.
 */
export function AzVideo({ src, webm, poster, label, className = "", posterOnNarrow = false, objectPosition, decorative = false, eager = false }: AzVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const narrow = useIsNarrow();
  const showPoster = reduced || (posterOnNarrow && narrow);

  useEffect(() => {
    const el = ref.current;
    if (!el || showPoster) return;
    el.muted = true;
    el.playsInline = true;
    const tryPlay = () => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => undefined);
    };
    if (typeof IntersectionObserver === "undefined") {
      tryPlay();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) tryPlay();
          else el.pause();
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showPoster, src]);

  const style = objectPosition ? { objectPosition } : undefined;

  if (showPoster) {
    return (
      <img
        src={poster}
        alt={decorative ? "" : label}
        aria-hidden={decorative || undefined}
        className={className}
        style={style}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...(eager ? { fetchpriority: "high" } : {})}
      />
    );
  }

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload={eager ? "auto" : "metadata"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      disablePictureInPicture
    >
      <source src={src} type="video/mp4" />
      {webm && <source src={webm} type="video/webm" />}
    </video>
  );
}
