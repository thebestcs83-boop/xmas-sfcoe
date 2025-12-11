"use client";

import { useEffect, useRef, useState } from "react";
import { ChristmasTree } from "@/components/ChristmasTree";
import { SurpriseEffects } from "@/components/SurpriseEffects";
import { QrInvite } from "@/components/QrInvite";
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
  const [snowOn, setSnowOn] = useState(false);
  const [santaOn, setSantaOn] = useState(false);
  const [selectedKudos, setSelectedKudos] = useState<Kudos | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isDark = theme === "dark";

  const [author, setAuthor] = useState("");
  const [toName, setToName] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState(emojiOptions[0]);
  const [color, setColor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [snowSpeedMultiplier, setSnowSpeedMultiplier] = useState(1);
  const [santaLoopTrigger, setSantaLoopTrigger] = useState(0);
  const snowBoostTimeout = useRef<number | null>(null);
  const [filterText, setFilterText] = useState("");

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

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      return;
    }

    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    const root = document.body;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(isDark ? "theme-dark" : "theme-light");
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  useEffect(() => {
    return () => {
      if (snowBoostTimeout.current) {
        window.clearTimeout(snowBoostTimeout.current);
      }
    };
  }, []);

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

  const containerClass = isDark
    ? "min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white"
    : "min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 text-emerald-900";

  const formPanelClass = isDark
    ? "space-y-4 rounded-3xl border border-emerald-200/20 bg-white/5 p-6 shadow-lg backdrop-blur"
    : "space-y-4 rounded-3xl border border-emerald-700/15 bg-white/80 p-6 shadow-lg backdrop-blur";

  const listPanelClass = isDark
    ? "rounded-3xl border border-emerald-200/20 bg-white/5 p-6 shadow-lg backdrop-blur"
    : "rounded-3xl border border-emerald-700/15 bg-white p-6 shadow-lg backdrop-blur";

  const cardClass = isDark
    ? "rounded-2xl border border-emerald-200/15 bg-emerald-900/30 p-4 shadow"
    : "rounded-2xl border border-emerald-700/10 bg-white p-4 shadow";

  const mutedText = isDark ? "text-emerald-100/80" : "text-emerald-800/80";
  const labelText = isDark ? "text-emerald-50/90" : "text-emerald-900";
  const headingAccent = isDark ? "text-emerald-200" : "text-emerald-700";
  const subHeading = isDark ? "text-white" : "text-emerald-950";

  const inputBase =
    "w-full rounded-xl border px-3 py-2 outline-none transition";
  const inputClass = isDark
    ? `${inputBase} border-emerald-200/30 bg-emerald-950/60 text-white focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/50`
    : `${inputBase} border-emerald-700/20 bg-white text-emerald-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30`;

  const toggleButtonClass = isDark
    ? "flex items-center gap-2 rounded-full border border-emerald-200/40 bg-white/5 px-3 py-2 text-sm text-emerald-50 transition hover:border-emerald-200/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
    : "flex items-center gap-2 rounded-full border border-emerald-700/30 bg-white px-3 py-2 text-sm text-emerald-800 shadow-sm transition hover:border-emerald-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500";

  const triggerTreeActivate = () => {
    setSnowSpeedMultiplier(0.5);
    setSantaLoopTrigger((c) => c + 1);
    if (snowBoostTimeout.current) {
      window.clearTimeout(snowBoostTimeout.current);
    }
    snowBoostTimeout.current = window.setTimeout(() => setSnowSpeedMultiplier(1), 1000);
  };

  const filteredKudos = filterText
    ? kudos.filter((k) =>
        k.to_name.toLowerCase().includes(filterText.trim().toLowerCase()),
      )
    : kudos;

  return (
    <main id="main-content" className={containerClass}>
      <SurpriseEffects
        snowOn={snowOn}
        santaOn={santaOn}
        snowSpeedMultiplier={snowSpeedMultiplier}
        santaLoopTrigger={santaLoopTrigger}
      />
      <div className="mx-auto w-full max-w-[1024px] px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex w-full flex-col gap-6">
            <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 w-full sm:max-w-md lg:max-w-lg">
                <p className={`text-sm uppercase tracking-[0.2em] ${headingAccent}`}>
                  XMAS KUDOS Tree
                </p>
                <p className={`text-xs ${mutedText}`}>By the SF CoE Consulting Team</p>
                <h1 className={`text-2xl font-semibold leading-tight ${subHeading} md:text-3xl`}>
                  Share gratitude as glowing ornaments
                </h1>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-1 sm:justify-end">
                <label className="flex min-w-[240px] flex-1 items-center gap-2 sm:max-w-xs">
                  <span className={`text-xs font-semibold ${mutedText}`}>Filter</span>
                  <input
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className={`${inputClass} h-9 text-sm`}
                    placeholder="Filter by recipient"
                    aria-label="Filter ornaments by recipient"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className={toggleButtonClass}
                  aria-pressed={isDark}
                  aria-label="Toggle light and dark mode"
                >
                  <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {isDark ? "Dark" : "Light"}
                  </span>
                </button>
              </div>
            </header>

            <ChristmasTree
              kudos={filteredKudos}
              isSnowOn={snowOn}
              setIsSnowOn={setSnowOn}
              isSantaOn={santaOn}
              setIsSantaOn={setSantaOn}
              selectedKudos={selectedKudos}
              onSelect={setSelectedKudos}
              onTreeActivate={triggerTreeActivate}
            />
          </div>

          <section className="flex w-full flex-col gap-5 lg:max-w-[420px] lg:gap-6">
            <form
              onSubmit={handleSubmit}
              className={formPanelClass}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm uppercase tracking-[0.2em] ${headingAccent}`}>
                    Send Kudos
                  </p>
                  <h2 className={`text-xl font-semibold ${subHeading}`}>
                    Drop an ornament on the tree
                  </h2>
                </div>
                {submitting && (
                  <span className={`text-xs ${mutedText}`}>Sending…</span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className={`space-y-1 text-sm ${labelText}`}>
                  From (optional)
                  <input
                    className={inputClass}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                  />
                </label>
                <label className={`space-y-1 text-sm ${labelText}`}>
                  To *
                  <input
                    required
                    className={inputClass}
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    placeholder="Who is this for?"
                  />
                </label>
                <label className={`space-y-1 text-sm ${labelText}`}>
                  Message *
                  <textarea
                    required
                    maxLength={200}
                    className={`${inputClass} min-h-[96px]`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something kind (max 200 chars)"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className={`text-sm ${mutedText}`}>Emoji</p>
                  <div className="grid grid-cols-6 gap-2">
                    {emojiOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEmoji(option)}
                        aria-pressed={emoji === option}
                        className={`flex h-10 items-center justify-center rounded-xl border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                          emoji === option
                            ? isDark
                              ? "border-white bg-white/20"
                              : "border-emerald-600 bg-emerald-50"
                            : isDark
                              ? "border-emerald-200/30 bg-white/5 hover:border-emerald-200/70"
                              : "border-emerald-300 bg-white hover:border-emerald-500/70"
                        }`}
                      >
                        <span className="text-lg">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={`text-sm ${mutedText}`}>Color</p>
                  <div className="flex flex-wrap gap-2">
                    {festiveColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-pressed={color === c}
                        className={`h-10 w-10 rounded-full border-2 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                          color === c
                            ? isDark
                              ? "border-white ring-2 ring-white/60"
                              : "border-emerald-600 ring-2 ring-emerald-500/40"
                            : isDark
                              ? "border-white/50"
                              : "border-emerald-600/40"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setColor("")}
                      aria-pressed={color === ""}
                      className={`flex h-10 items-center justify-center rounded-full border border-dashed px-3 text-xs uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 ${
                        color === ""
                          ? isDark
                            ? "border-white text-white"
                            : "border-emerald-700 text-emerald-900"
                          : isDark
                            ? "border-white/50 text-emerald-100/80"
                            : "border-emerald-700/50 text-emerald-800/80"
                      }`}
                    >
                      Random
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <p
                  className={`text-sm ${isDark ? "text-rose-200" : "text-rose-600"}`}
                  role="alert"
                >
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

            <div className={listPanelClass}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${subHeading}`}>Recent kudos</h3>
                {loading && (
                  <span className={`text-xs ${mutedText}`}>Loading…</span>
                )}
              </div>
              {loading && !kudos.length ? (
                <p className={`text-sm ${mutedText}`}>Loading kudos…</p>
              ) : (
                <div className="flex max-h-[460px] flex-col gap-3 overflow-y-auto pr-1">
                  {filteredKudos.slice(0, 30).map((item) => (
                    <article
                      key={item.id}
                      className={cardClass}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <div>
                            <p className={`text-base font-semibold ${subHeading}`}>
                              To {item.to_name}
                            </p>
                            <p className={`text-sm ${mutedText}`}>
                              From {item.author || "Anonymous"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p
                        className={`mt-2 text-sm leading-relaxed ${
                          isDark ? "text-emerald-50/90" : "text-emerald-900/80"
                        }`}
                      >
                        {item.message}
                      </p>
                    </article>
                  ))}
                  {!kudos.length && (
                    <p className={`text-sm ${mutedText}`}>
                      No kudos yet — be the first!
                    </p>
                  )}
                </div>
              )}
            </div>

            <QrInvite />
          </section>
        </div>
      </div>
    </main>
  );
}