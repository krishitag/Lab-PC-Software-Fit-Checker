import { useMemo } from 'react';
import type { CSSProperties } from 'react';

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  maxOpacity: number;
  minOpacity: number;
  twinkleDuration: number;
  twinkleDelay: number;
  driftDuration: number;
  driftDelay: number;
  driftDistance: number;
}

const STAR_COUNT = 120;

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Roughly 1 in 8 stars is a bigger, brighter standout among the small ones. */
const BIG_STAR_CHANCE = 0.12;

function createStars(count: number): Star[] {
  return Array.from({ length: count }, (_, id) => {
    const isBig = Math.random() < BIG_STAR_CHANCE;
    const maxOpacity = isBig ? random(0.7, 1) : random(0.3, 0.9);
    return {
      id,
      top: random(0, 100),
      left: random(0, 100),
      size: isBig ? random(3.5, 6) : random(1, 2.5),
      maxOpacity,
      minOpacity: maxOpacity * random(0.15, 0.4),
      twinkleDuration: random(2, 5),
      twinkleDelay: random(0, 5),
      driftDuration: random(14, 30),
      driftDelay: random(0, 10),
      driftDistance: random(6, 18),
    };
  });
}

/** Purely decorative, fixed behind all content — generated once per mount, not tied to any app state. */
export function StarfieldBackground() {
  const stars = useMemo(() => createStars(STAR_COUNT), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {stars.map((star) => (
        <span
          key={star.id}
          className="star absolute rounded-full bg-white"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.maxOpacity * 0.5})`,
              '--max-opacity': star.maxOpacity,
              '--min-opacity': star.minOpacity,
              '--drift-distance': `${star.driftDistance}px`,
              animation: `twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite, drift ${star.driftDuration}s ease-in-out ${star.driftDelay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
