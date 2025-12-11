"use client";

import QRCode from "react-qr-code";

export function QrInvite() {
  const url = "https://xmas-sfcoe.vercel.app";

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-center text-slate-100 shadow-lg">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Scan to open the Xmas Kudos Tree
      </div>
      <div className="rounded-md bg-white p-3">
        <QRCode value={url} size={120} bgColor="#ffffff" fgColor="#0f172a" />
      </div>
      <div className="break-all text-[11px] text-slate-400">{url}</div>
    </div>
  );
}

