"use client";

import React, { useEffect, useRef, useState } from "react";

type Kudos = {
  id: string;
  author: string | null;
  to_name: string;
  message: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  created_at: string;
};

type ChristmasTreeProps = {
  kudos: Kudos[];
  isSnowOn: boolean;
  setIsSnowOn: (v: boolean) => void;
  isSantaOn: boolean;
  setIsSantaOn: (v: boolean) => void;
  selectedKudos: Kudos | null;
  onSelect: (kudos: Kudos) => void;
  onTreeActivate: () => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ChristmasTree({
  kudos,
  isSnowOn,
  setIsSnowOn,
  isSantaOn,
  setIsSantaOn,
  selectedKudos,
  onSelect,
  onTreeActivate,
}: ChristmasTreeProps) {
  const [wiggle, setWiggle] = useState(false);
  const wiggleTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (wiggleTimeout.current) {
        window.clearTimeout(wiggleTimeout.current);
      }
    };
  }, []);

  const handleTreeClick = () => {
    if (wiggleTimeout.current) {
      window.clearTimeout(wiggleTimeout.current);
    }
    setWiggle(true);
    wiggleTimeout.current = window.setTimeout(() => {
      setWiggle(false);
    }, 1000);
    onTreeActivate();
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-b from-emerald-900/60 via-emerald-950 to-emerald-950 p-6 shadow-2xl">
      <Snowman />
      <div className="absolute left-4 top-3 z-20 flex flex-col items-start gap-2 text-xs text-slate-100 md:text-sm">
        <div className="flex items-center gap-1">
          <span>Snow</span>
          <Toggle label="Snow" checked={isSnowOn} onCheckedChange={setIsSnowOn} />
        </div>
        <div className="flex items-center gap-1">
          <span>Santa</span>
          <Toggle label="Santa" checked={isSantaOn} onCheckedChange={setIsSantaOn} />
        </div>
      </div>

      <div
        className="relative mx-auto aspect-[3/4] max-h-[640px] w-full max-w-[520px] pt-8"
        onClick={handleTreeClick}
        role="presentation"
      >
        <div
          className="absolute inset-0 rounded-b-[28px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.55)]"
          style={{
            background:
              "linear-gradient(160deg, #14532d 0%, #0f172a 55%, #0b5d33 100%)",
            clipPath: "polygon(50% 0%, 92% 78%, 70% 78%, 90% 100%, 50% 88%, 10% 100%, 30% 78%, 8% 78%)",
            border: "2px solid rgba(226, 232, 240, 0.12)",
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-[6%] z-30 -translate-x-1/2">
          <div className="tree-star" />
        </div>
        <div
          className="absolute left-1/2 top-[78%] h-16 w-12 -translate-x-1/2 rounded-md bg-amber-900/80 shadow-lg"
        />
        <GiftsRow />
        <div className="absolute inset-0">
          {kudos.slice(0, 50).map((item) => (
            <Ornament
              key={item.id}
              kudos={item}
              wiggle={wiggle}
              twinkle={isSnowOn}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-200/20 bg-slate-900/70 p-4 shadow-lg md:hidden">
        {selectedKudos ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedKudos.emoji}</span>
              <p className="text-base font-semibold text-white">
                To {selectedKudos.to_name}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-emerald-50/90">
              {selectedKudos.message}
            </p>
            <p className="text-xs text-emerald-200/80">
              From {selectedKudos.author || "Anonymous"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-emerald-100/80">
            Tap an ornament on the tree to see its message.
          </p>
        )}
      </div>
    </section>
  );
}

type OrnamentProps = {
  kudos: Kudos;
  twinkle: boolean;
  wiggle: boolean;
  onSelect?: (kudos: Kudos) => void;
};

function Ornament({ kudos, twinkle, wiggle, onSelect }: OrnamentProps) {
  const left = clamp(kudos.x, 0, 1) * 100;
  const top = clamp(kudos.y, 0, 1) * 100;

  return (
    <div
      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-200"
      onClick={() => onSelect?.(kudos)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(kudos);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View message to ${kudos.to_name}${kudos.author ? ` from ${kudos.author}` : ""}`}
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-2xl shadow-lg transition hover:scale-110 ${twinkle ? "ornament-twinkle" : ""} ${wiggle ? "ornament-wiggle" : ""}`}
          style={{ backgroundColor: kudos.color }}
        >
          {kudos.emoji}
        </div>
        <span
          className="pointer-events-none mt-1 max-w-[80px] truncate rounded-full bg-emerald-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-50 shadow-sm backdrop-blur"
          aria-hidden="true"
        >
          {kudos.to_name}
        </span>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-56 -translate-x-1/2 rounded-xl border border-emerald-200/40 bg-slate-950/95 px-3 py-2 text-sm leading-snug text-emerald-50 shadow-xl backdrop-blur group-hover:block group-focus-visible:block">
        <p className="font-semibold text-white">To {kudos.to_name}</p>
        <p className="text-emerald-100/90">{kudos.message}</p>
        <p className="mt-1 text-xs text-emerald-200/80">
          From {kudos.author || "Anonymous"}
        </p>
      </div>
    </div>
  );
}

type ToggleProps = {
  checked: boolean;
  label: string;
  onCheckedChange: (v: boolean) => void;
};

function Toggle({ checked, label, onCheckedChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`flex h-8 w-14 items-center rounded-full border border-emerald-300/40 bg-white/10 px-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 ${
        checked ? "justify-end bg-emerald-400/40" : "justify-start"
      }`}
    >
      <span className="h-6 w-6 rounded-full bg-white shadow-md transition" />
    </button>
  );
}

function Snowman() {
  return (
    <div
      className="pointer-events-none absolute left-3 bottom-12 z-20 scale-90 sm:left-[10%] sm:bottom-10 sm:scale-100 md:left-[11%] lg:left-[13%]"
      aria-hidden="true"
    >
      <div className="snowman">
        <div className="snowman-head">
          <span className="snowman-face">⛄</span>
        </div>
        <div className="snowman-body">
          <div className="snowman-buttons" />
        </div>
        <div className="snowman-arm snowman-arm-left" />
        <div className="snowman-arm snowman-arm-right" />
      </div>
    </div>
  );
}

function GiftsRow() {
  const gifts = [
    { color: "bg-gradient-to-br from-amber-300 to-amber-500", accent: "bg-emerald-700" },
    { color: "bg-gradient-to-br from-sky-300 to-sky-500", accent: "bg-pink-500" },
    { color: "bg-gradient-to-br from-rose-300 to-rose-500", accent: "bg-amber-700" },
    { color: "bg-gradient-to-br from-violet-300 to-indigo-500", accent: "bg-lime-400" },
  ];

  return (
    <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-end gap-2 sm:gap-3">
      {gifts.map((gift, idx) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          className={`relative h-10 w-10 rounded-sm shadow-lg shadow-black/40 ${gift.color}`}
          style={{ transform: `translateY(${idx % 2 === 0 ? "0px" : "4px"})` }}
        >
          <div className={`absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 ${gift.accent}`} />
          <div className={`absolute inset-x-0 top-2 h-1.5 ${gift.accent}`} />
          <div className="absolute -top-2 left-1/2 h-3 w-2 -translate-x-1/2 rounded-sm bg-white/90" />
        </div>
      ))}
    </div>
  );
}

