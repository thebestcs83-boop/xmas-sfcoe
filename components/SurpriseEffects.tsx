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
    // Santa + reindeers flight state in percentage of viewport
    const [state, setState] = React.useState(() => {
      const angle = Math.random() * Math.PI * 2; // random 0..360°
      const vx = Math.cos(angle);
      const vy = Math.sin(angle);
      return {
        x: 50,   // start roughly center
        y: 25,   // top-half (0..50)
        vx,
        vy,
      };
    });
  
    const rafRef = React.useRef<number | null>(null);
  
    React.useEffect(() => {
      let last = performance.now();
  
      const tick = (now: number) => {
        const dt = (now - last) / 1000; // seconds
        last = now;
  
        setState(prev => {
          let { x, y, vx, vy } = prev;
  
          const SPEED = 18; // % of screen per second
          const TOP = 5;    // keep santa in 5–45% vertical band
          const BOTTOM = 45;
          const LEFT = 0;
          const RIGHT = 100;
  
          // move
          x += vx * SPEED * dt;
          y += vy * SPEED * dt;
  
          // bounce logic – reflect velocity when touching edges
          if (x <= LEFT) {
            x = LEFT;
            vx = Math.abs(vx); // go right
          } else if (x >= RIGHT) {
            x = RIGHT;
            vx = -Math.abs(vx); // go left
          }
  
          if (y <= TOP) {
            y = TOP;
            vy = Math.abs(vy); // go down
          } else if (y >= BOTTOM) {
            y = BOTTOM;
            vy = -Math.abs(vy); // go up
          }
  
          return { x, y, vx, vy };
        });
  
        rafRef.current = requestAnimationFrame(tick);
      };
  
      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }, []);
  
    const { x, y, vx, vy } = state;
  
    // direction vector + angle for rotation
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len;
    const uy = vy / len;
    const angleDeg = (Math.atan2(uy, ux) * 180) / Math.PI;
  
    // Santa is the lead; reindeers trail behind along the opposite direction
    const spacing = 6; // distance between emojis in % of screen
    const santaPos = { x, y };
    const deerOffsets = [1, 2, 3, 4]; // number of reindeers
  
    const deerPositions = deerOffsets.map(i => ({
      x: x - ux * spacing * i,
      y: y - uy * spacing * i,
    }));
  
    return (
      <div className="pointer-events-none fixed inset-0 z-40 overflow-visible">
        {/* Santa (lead) */}
        <FlyingEmoji
          emoji="🎅"
          x={santaPos.x}
          y={santaPos.y}
          angleDeg={angleDeg}
          sizeClass="text-4xl"
        />
        {/* Reindeers trailing behind */}
        {deerPositions.map((pos, idx) => (
          <FlyingEmoji
            key={idx}
            emoji="🦌"
            x={pos.x}
            y={pos.y}
            angleDeg={angleDeg}
            sizeClass="text-3xl"
          />
        ))}
        {/* gift trailing at the end */}
        <FlyingEmoji
          emoji="🎁"
          x={x - ux * spacing * (deerOffsets.length + 1)}
          y={y - uy * spacing * (deerOffsets.length + 1)}
          angleDeg={angleDeg}
          sizeClass="text-2xl"
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
  };
  
  function FlyingEmoji({ emoji, x, y, angleDeg, sizeClass }: FlyingEmojiProps) {
    return (
      <div
        className={`absolute drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${sizeClass ?? "text-3xl"}`}
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
  


