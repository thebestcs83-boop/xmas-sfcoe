"use client";

import React from "react";

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
}: ChristmasTreeProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-b from-emerald-900/60 via-emerald-950 to-emerald-950 p-6 shadow-2xl">
      <div className="absolute left-4 top-3 z-20 flex items-center gap-4 text-xs text-slate-100 md:text-sm">
        <div className="flex items-center gap-1">
          <span>Snow</span>
          <Toggle checked={isSnowOn} onCheckedChange={setIsSnowOn} />
        </div>
        <div className="flex items-center gap-1">
          <span>Santa</span>
          <Toggle checked={isSantaOn} onCheckedChange={setIsSantaOn} />
        </div>
      </div>

      <div className="relative mx-auto aspect-[3/4] max-h-[640px] w-full max-w-[520px] pt-8">
        <div
          className="absolute inset-0 rounded-b-[28px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.55)]"
          style={{
            background:
              "linear-gradient(160deg, #14532d 0%, #0f172a 55%, #0b5d33 100%)",
            clipPath: "polygon(50% 0%, 92% 78%, 70% 78%, 90% 100%, 50% 88%, 10% 100%, 30% 78%, 8% 78%)",
            border: "2px solid rgba(226, 232, 240, 0.12)",
          }}
        />
        <div
          className="absolute left-1/2 top-[78%] h-16 w-12 -translate-x-1/2 rounded-md bg-amber-900/80 shadow-lg"
        />
        <div className="absolute inset-0">
          {kudos.slice(0, 50).map((item) => (
            <Ornament
              key={item.id}
              kudos={item}
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
  onSelect?: (kudos: Kudos) => void;
};

function Ornament({ kudos, twinkle, onSelect }: OrnamentProps) {
  const left = clamp(kudos.x, 0, 1) * 100;
  const top = clamp(kudos.y, 0, 1) * 100;

  return (
    <div
      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
      onClick={() => onSelect?.(kudos)}
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-2xl shadow-lg transition hover:scale-110 ${
          twinkle ? "ornament-twinkle" : ""
        }`}
        style={{ backgroundColor: kudos.color }}
      >
        {kudos.emoji}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-3 hidden w-56 -translate-x-1/2 rounded-xl border border-emerald-200/40 bg-slate-950/95 px-3 py-2 text-sm leading-snug text-emerald-50 shadow-xl backdrop-blur group-hover:block">
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
  onCheckedChange: (v: boolean) => void;
};

function Toggle({ checked, onCheckedChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`flex h-8 w-14 items-center rounded-full border border-emerald-300/40 bg-white/10 px-1 transition ${
        checked ? "justify-end bg-emerald-400/40" : "justify-start"
      }`}
    >
      <span className="h-6 w-6 rounded-full bg-white shadow-md transition" />
    </button>
  );
}

