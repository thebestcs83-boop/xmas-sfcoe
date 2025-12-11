// components/SurpriseEffects.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReduced(mediaQuery.matches);

    updatePreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updatePreference);
    } else {
      // Older Safari
      // eslint-disable-next-line deprecation/deprecation
      mediaQuery.addListener(updatePreference);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updatePreference);
      } else {
        // eslint-disable-next-line deprecation/deprecation
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);

  return prefersReduced;
}

type SurpriseEffectsProps = {
  snowOn: boolean;
  santaOn: boolean;
  snowSpeedMultiplier?: number;
  santaLoopTrigger?: number;
};

/**
 * Render any combination of snow and Santa overlays.
 */
export function SurpriseEffects({
  snowOn,
  santaOn,
  snowSpeedMultiplier = 1,
  santaLoopTrigger = 0,
}: SurpriseEffectsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion || (!snowOn && !santaOn)) return null;

  return (
    <>
      {snowOn && <SnowEffect speedMultiplier={snowSpeedMultiplier} />}
      {santaOn && <SantaFlightEffect loopTrigger={santaLoopTrigger} />}
    </>
  );
}

/* ------------------ Surprise Mode 1: Snow ------------------ */

function SnowEffect({ speedMultiplier }: { speedMultiplier: number }) {
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
            animationDelay: `${flake.delay * speedMultiplier}s`,
            animationDuration: `${flake.duration * speedMultiplier}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------ Surprise Mode 2: Santa + reindeers ------------------ */

function SantaFlightEffect({ loopTrigger }: { loopTrigger: number }) {
    const [isLooping, setIsLooping] = useState(false);
  
    useEffect(() => {
      if (!loopTrigger) return;
      setIsLooping(true);
      const t = window.setTimeout(() => setIsLooping(false), 1000);
      return () => window.clearTimeout(t);
    }, [loopTrigger]);
  
    // circular flight around tree center
    const [angleState, setAngleState] = React.useState(() => ({
      angle: Math.random() * Math.PI * 2,
    }));
  
    const rafRef = React.useRef<number | null>(null);
  
    React.useEffect(() => {
      let last = performance.now();
      const tick = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        setAngleState((prev) => ({
          angle: (prev.angle + dt * 0.65 * Math.PI) % (Math.PI * 2),
        }));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }, []);
  
    const angle = angleState.angle;
    const centerX = 50;
    const centerY = 44;
    const radiusX = 32;
    const radiusY = 20;
  
    const santaX = centerX + Math.cos(angle) * radiusX;
    const santaY = centerY + Math.sin(angle) * radiusY;
  
    // tangential direction for orientation/trailing
    const vx = -Math.sin(angle) * radiusX;
    const vy = Math.cos(angle) * radiusY;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len;
    const uy = vy / len;
    const angleDeg = (Math.atan2(uy, ux) * 180) / Math.PI;
  
    const spacing = 6;
    const deerOffsets = [1, 2, 3, 4];
  
    const deerPositions = deerOffsets.map((i) => ({
      x: santaX - ux * spacing * i,
      y: santaY - uy * spacing * i,
    }));
  
    return (
      <div className="pointer-events-none fixed inset-0 z-40 overflow-visible">
        <FlyingEmoji
          emoji="🎅"
          x={santaX}
          y={santaY}
          angleDeg={angleDeg}
          sizeClass="text-4xl"
          looping={isLooping}
        />
        {deerPositions.map((pos, idx) => (
          <FlyingEmoji
            key={idx}
            emoji="🦌"
            x={pos.x}
            y={pos.y}
            angleDeg={angleDeg}
            sizeClass="text-3xl"
            looping={isLooping}
          />
        ))}
        <FlyingEmoji
          emoji="🎁"
          x={santaX - ux * spacing * (deerOffsets.length + 1)}
          y={santaY - uy * spacing * (deerOffsets.length + 1)}
          angleDeg={angleDeg}
          sizeClass="text-2xl"
          looping={isLooping}
        />
      </div>
    );
  }
  
  type FlyingEmojiProps = {
    emoji: string;
    x: number;        // 0–100 (% of viewport width)
    y: number;        // 0–100 (% of viewport height)
    angleDeg: number; // direction of travel
    sizeClass?: string;
    looping?: boolean;
  };
  
  function FlyingEmoji({ emoji, x, y, angleDeg, sizeClass, looping }: FlyingEmojiProps) {
    return (
      <div
        className={`absolute drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${sizeClass ?? "text-3xl"} ${looping ? "santa-loop" : ""}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
          transition: "transform 0.05s linear",
        }}
      >
        {emoji}
      </div>
    );
  }
  


