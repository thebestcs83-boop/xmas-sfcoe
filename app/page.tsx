"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

const festiveColors = ["#e11d48", "#22c55e", "#fbbf24", "#38bdf8", "#f97316"];
const emojiOptions = ["🎄", "🎁", "⭐", "❄️", "❤️", "🔔"];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const formatRelativeTime = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSeconds = Math.floor((then - now) / 1000);

  const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [7, "days"],
  ];

  let value = diffSeconds;
  let unit: Intl.RelativeTimeFormatUnit = "seconds";

  for (let i = 0; i < intervals.length && Math.abs(value) >= intervals[i][0]; i += 1) {
    value = Math.floor(value / intervals[i][0]);
    unit = intervals[i][1];
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    value,
    unit,
  );
};

export default function Home() {
  const [kudos, setKudos] = useState<Kudos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surpriseMode, setSurpriseMode] = useState(false);

  const [author, setAuthor] = useState("");
  const [toName, setToName] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState(emojiOptions[0]);
  const [color, setColor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchKudos = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("kudos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        setError("Unable to load kudos right now.");
        setLoading(false);
        return;
      }

      setKudos(data ?? []);
      setLoading(false);
    };

    fetchKudos();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("kudos-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "kudos" },
        (payload) => {
          const incoming = payload.new as Kudos;
          setKudos((prev) => {
            if (prev.find((k) => k.id === incoming.id)) return prev;
            return [incoming, ...prev].slice(0, 50);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const snowflakes = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 8,
        delay: Math.random() * 5,
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!toName.trim() || !message.trim()) {
      setError("Please add a recipient and a message.");
      return;
    }

    setSubmitting(true);

    const ornamentColor =
      color || festiveColors[Math.floor(Math.random() * festiveColors.length)];

    const payload = {
      author: author.trim() || null,
      to_name: toName.trim(),
      message: message.trim(),
      emoji,
      color: ornamentColor,
      x: Number(randomBetween(0.2, 0.8).toFixed(3)),
      y: Number(randomBetween(0.15, 0.9).toFixed(3)),
    };

    const { data, error: insertError } = await supabase
      .from("kudos")
      .insert(payload)
      .select()
      .single();

    if (insertError || !data) {
      setError("Could not send kudos. Please try again.");
      setSubmitting(false);
      return;
    }

    setKudos((prev) => [data as Kudos, ...prev].slice(0, 50));
    setAuthor("");
    setToName("");
    setMessage("");
    setColor("");
    setEmoji(emojiOptions[0]);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10 lg:flex-row lg:py-14">
        <header className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
              Christmas Kudos Tree
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-white">
              Share gratitude as glowing ornaments
            </h1>
            <p className="text-sm text-emerald-100/80">
              Powered by Supabase — live and anonymous.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-emerald-100/80">Surprise Mode</span>
            <button
              type="button"
              onClick={() => setSurpriseMode((prev) => !prev)}
              className={`flex h-9 w-16 items-center rounded-full border border-emerald-300/40 bg-white/10 px-1 transition ${
                surpriseMode ? "justify-end bg-emerald-400/40" : "justify-start"
              }`}
            >
              <span className="h-7 w-7 rounded-full bg-white shadow-md transition" />
            </button>
          </div>
        </header>

        <main className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <section className="relative overflow-hidden rounded-3xl border border-emerald-300/20 bg-gradient-to-b from-emerald-900/60 via-emerald-950 to-emerald-950 p-6 shadow-2xl">
            {surpriseMode && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {snowflakes.map((flake) => (
                  <span
                    key={flake.id}
                    className="snowflake"
                    style={{
                      left: `${flake.left}%`,
                      width: flake.size,
                      height: flake.size,
                      animationDuration: `${flake.duration}s`,
                      animationDelay: `${flake.delay}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="relative mx-auto aspect-[3/4] max-h-[640px] w-full max-w-[520px]">
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
                  <Ornament key={item.id} kudos={item} twinkle={surpriseMode} />
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-3xl border border-emerald-200/20 bg-white/5 p-6 shadow-lg backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                    Send Kudos
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Drop an ornament on the tree
                  </h2>
                </div>
                {submitting && (
                  <span className="text-xs text-emerald-100/80">Sending…</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-1 text-sm text-emerald-50/90">
                  From (optional)
                  <input
                    className="w-full rounded-xl border border-emerald-200/30 bg-emerald-950/60 px-3 py-2 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/50"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label className="space-y-1 text-sm text-emerald-50/90">
                  To *
                  <input
                    required
                    className="w-full rounded-xl border border-emerald-200/30 bg-emerald-950/60 px-3 py-2 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/50"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    placeholder="Who is this for?"
                  />
                </label>
                <label className="space-y-1 text-sm text-emerald-50/90">
                  Message *
                  <textarea
                    required
                    maxLength={200}
                    className="min-h-[96px] w-full rounded-xl border border-emerald-200/30 bg-emerald-950/60 px-3 py-2 text-white outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/50"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something kind (max 200 chars)"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-emerald-50/80">Emoji</p>
                  <div className="grid grid-cols-6 gap-2">
                    {emojiOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEmoji(option)}
                        className={`flex h-10 items-center justify-center rounded-xl border transition ${
                          emoji === option
                            ? "border-white bg-white/20"
                            : "border-emerald-200/30 bg-white/5 hover:border-emerald-200/70"
                        }`}
                      >
                        <span className="text-lg">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-emerald-50/80">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {festiveColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-10 w-10 rounded-full border-2 transition hover:scale-105 ${
                          color === c
                            ? "border-white ring-2 ring-white/60"
                            : "border-white/50"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setColor("")}
                      className={`flex h-10 items-center justify-center rounded-full border border-dashed px-3 text-xs uppercase tracking-wider ${
                        color === "" ? "border-white text-white" : "border-white/50 text-emerald-100/80"
                      }`}
                    >
                      Random
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-200" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-300 px-4 py-3 text-center text-base font-semibold text-emerald-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Sending..." : "Send Kudos"}
              </button>
            </form>

            <div className="rounded-3xl border border-emerald-200/20 bg-white/5 p-6 shadow-lg backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Recent kudos</h3>
                {loading && (
                  <span className="text-xs text-emerald-100/80">Loading…</span>
                )}
              </div>
              {loading && !kudos.length ? (
                <p className="text-sm text-emerald-100/80">Loading kudos…</p>
              ) : (
                <div className="flex max-h-[460px] flex-col gap-3 overflow-y-auto pr-1">
                  {kudos.slice(0, 30).map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-emerald-200/15 bg-emerald-900/30 p-4 shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <div>
                            <p className="text-base font-semibold text-white">
                              To {item.to_name}
                            </p>
                            <p className="text-sm text-emerald-100/80">
                              From {item.author || "Anonymous"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-100/70">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
                        {item.message}
                      </p>
                    </article>
                  ))}
                  {!kudos.length && (
                    <p className="text-sm text-emerald-100/80">
                      No kudos yet — be the first!
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

type OrnamentProps = {
  kudos: Kudos;
  twinkle: boolean;
};

function Ornament({ kudos, twinkle }: OrnamentProps) {
  const left = clamp(kudos.x, 0, 1) * 100;
  const top = clamp(kudos.y, 0, 1) * 100;

  return (
    <div
      className="group absolute -translate-x-1/2 -translate-y-1/2"
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
