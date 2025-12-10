// components/SurpriseEffects.tsx
"use client";

import React, { useMemo } from "react";

/**
 * Render any combination of snow and Santa overlays.
 */
export function SurpriseEffects({ snowOn, santaOn }: { snowOn: boolean; santaOn: boolean }) {
  if (!snowOn && !santaOn) return null;

  return (
    <>
      {snowOn && <SnowEffect />}
      {santaOn && <SantaFlightEffect />}
    </>
  );
}

/* ------------------ Surprise Mode 1: Snow ------------------ */

function SnowEffect() {
  // This is a simple, light snow overlay. If you already have a snow
  // implementation, you can replace this with your existing JSX.
  const flakes = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 8 + Math.random() * 8,
        delay: -Math.random() * 12,
        opacity: 0.5 + Math.random() * 0.4,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="pointer-events-none absolute rounded-full bg-white/80 blur-[1px] animate-[snow-fall_12s_linear_infinite]"
          style={{
            left: `${flake.left}%`,
            top: "-10%",
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------ Surprise Mode 2: Santa + reindeers ------------------ */

function SantaFlightEffect() {
  const flights = useMemo(
    () =>
      Array.from({ length: 1 }).map(() => {
        const duration = 10 + Math.random() * 6; // faster than before
        const delay = Math.random() * 4;
        const direction = Math.random() > 0.5 ? "normal" : "reverse";
        const topOffset = Math.random() * 12;
        const scale = 0.9 + Math.random() * 0.25;
        return { duration, delay, direction, topOffset, scale };
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center overflow-hidden">
      {flights.map((flight, idx) => (
        <div
          key={idx}
          className="relative h-32 w-[220%]"
          style={{
            animation: `santa-flight ${flight.duration}s linear infinite`,
            animationDelay: `${flight.delay}s`,
            animationDirection: flight.direction as "normal" | "reverse",
            top: `${flight.topOffset}px`,
            transform: `scale(${flight.scale})`,
          }}
        >
          <div className="absolute left-0 top-4 flex items-center gap-2 text-4xl drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]">
            <span>🎅</span>
            <span>🦌</span>
            <span>🦌</span>
            <span>🦌</span>
            <span>🦌</span>
            <span className="text-2xl ml-2">🎁</span>
          </div>
        </div>
      ))}
    </div>
  );
}


