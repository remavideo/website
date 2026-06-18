import { cn } from "@remavideo/ui";
import { useEffect, useState } from "react";

const SCRIPT = [
  "This program is a rema pipeline:",
  "RTMP in → CEA-708 captions → RTMP out.",
  "Every node is a line of TypeScript.",
  "These captions were injected mid-stream,",
  "frame-accurate, with no re-encoding.",
  "Schedule them ahead, or send them live.",
];

const FRAME_RATE = 30;

/** Formats elapsed frames as SMPTE timecode (HH:MM:SS:FF). */
function timecode(totalFrames: number): string {
  const f = totalFrames % FRAME_RATE;
  const s = Math.floor(totalFrames / FRAME_RATE);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
}

/**
 * A mock broadcast monitor with roll-up captions cycling through a script,
 * a pulsing ON AIR tally, and a running SMPTE timecode.
 */
export function CaptionMonitor({ className }: { className?: string }) {
  const [lineIndex, setLineIndex] = useState(1);
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    const captionTimer = setInterval(() => setLineIndex((i) => i + 1), 2600);
    const frameTimer = setInterval(
      () => setFrames((f) => f + 3),
      3000 / FRAME_RATE,
    );
    return () => {
      clearInterval(captionTimer);
      clearInterval(frameTimer);
    };
  }, []);

  const current = SCRIPT[lineIndex % SCRIPT.length] ?? "";
  const previous = SCRIPT[(lineIndex - 1) % SCRIPT.length] ?? "";

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-screen-line bg-screen overflow-hidden",
        "shadow-[0_24px_60px_-24px_rgba(20,12,6,0.55)]",
        className,
      )}
    >
      {/* Monitor header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-screen-raised border-b border-screen-line">
        <div className="flex items-center gap-2">
          <span className="tally-pulse w-2.5 h-2.5 rounded-full bg-[#f85149]" />
          <span className="font-mono text-[11px] tracking-[0.18em] text-[#f3eee3]">
            ON AIR
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#a2967f] tabular-nums">
          {timecode(frames)}
        </span>
        <span className="font-mono text-[11px] tracking-wider text-[#a2967f]">
          PGM · 1080p59.94
        </span>
      </div>

      {/* "Video" area */}
      <div className="scanlines relative aspect-video">
        {/* Abstract program feed */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_15%,#3d2417_0%,#1b120c_45%,#0c0b09_100%)]" />
        <div className="absolute inset-0 dot-field text-white/[0.05]" />

        {/* Safe-area markers */}
        <div className="absolute inset-[7%] border border-white/[0.07] rounded-sm pointer-events-none" />

        {/* CC badge */}
        <div className="absolute top-[10%] right-[10%] font-mono text-[10px] tracking-widest text-white/40 border border-white/20 rounded px-1.5 py-0.5">
          CC1
        </div>

        {/* Roll-up captions */}
        <div className="absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-1 px-6">
          <span
            key={`prev-${lineIndex}`}
            className="caption-bar rounded-[3px] px-2.5 py-1 text-[11px] sm:text-[13px] leading-snug text-center opacity-70"
          >
            {previous.toUpperCase()}
          </span>
          <span
            key={`cur-${lineIndex}`}
            className="caption-bar rise-in rounded-[3px] px-2.5 py-1 text-[11px] sm:text-[13px] leading-snug text-center"
          >
            {current.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Monitor footer: injection status */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-screen-raised border-t border-screen-line font-mono text-[11px]">
        <span className="text-[#b9d99a]">SEI ✓ CEA-708 service 1</span>
        <span className="text-[#a2967f]">re-encode: none</span>
      </div>
    </div>
  );
}
