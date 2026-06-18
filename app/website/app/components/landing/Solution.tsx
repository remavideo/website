import { ArrowRight, MonitorPlay, Network, Radio } from "lucide-react";
import { CodeBlock } from "../code/CodeBlock";

function FlowArrow() {
  return (
    <div className="flex items-center flex-none px-1 text-default-400">
      <div className="w-5 h-px bg-current" />
      <ArrowRight size={13} className="-ml-0.5" />
    </div>
  );
}

function FlowBox({
  icon,
  label,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 flex flex-col items-center gap-1.5 min-w-[112px] ${
        highlight
          ? "border-primary/50 bg-primary/[0.07] shadow-[0_8px_24px_-10px_rgba(216,69,18,0.35)]"
          : "border-divider bg-content1"
      }`}
    >
      <div className={highlight ? "text-primary" : "text-default-500"}>
        {icon}
      </div>
      <div
        className={`text-xs font-semibold ${highlight ? "text-foreground" : "text-default-600"}`}
      >
        {label}
      </div>
      <div className="text-[10px] text-default-400 text-center leading-tight">
        {sub}
      </div>
    </div>
  );
}

export function Solution() {
  return (
    <section className="py-24 bg-content1/60 border-y border-divider relative overflow-hidden grain">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
              HOW IT WORKS
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground mb-6 leading-[1.08]">
              Describe the graph. Rema runs it.
            </h2>
            <p className="text-default-500 text-lg leading-relaxed mb-8">
              Declare inputs, processors, and outputs as nodes, then subscribe
              them together. Rema turns the graph into supervised FFmpeg
              processes and keeps it alive. Need captions? Drop a{" "}
              <code className="font-mono text-base text-primary">cea608()</code>{" "}
              processor between input and output — SEI frames are injected
              mid-stream, with no transcoding and no quality loss.
            </p>
            <ul className="space-y-3">
              {[
                "Inputs: RTMP, SRT, and looping files — from OBS, vMix, or any encoder",
                "Processors: CEA-608/708 caption injection, stream probing, fan-in and fan-out",
                "Outputs: RTMP, multi-rendition HLS to S3 or disk, file recording",
                "Type-checked wiring — bad graphs fail at compile time, not on air",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-default-600"
                >
                  <span className="mt-1 w-3.5 h-3.5 rounded-sm bg-primary/15 flex items-center justify-center flex-none">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-primary" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: flow diagram + schedule code */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center">
              <FlowBox
                icon={<MonitorPlay size={20} />}
                label="Inputs"
                sub="RTMP · SRT · file"
              />
              <FlowArrow />
              <FlowBox
                icon={<Network size={20} />}
                label="rema graph"
                sub="route · caption · probe"
                highlight
              />
              <FlowArrow />
              <FlowBox
                icon={<Radio size={20} />}
                label="Outputs"
                sub="RTMP · HLS · file"
              />
            </div>

            {/* Vertical connector */}
            <div className="w-px h-8 bg-gradient-to-b from-primary/60 to-primary/10" />

            <CodeBlock
              className="!my-0 w-full max-w-md"
              filename="caption-schedule.ts"
              code={`await captions.send("Welcome!", { startAt: 0, duration: 5_000 })
await captions.send("Thanks for joining.", { startAt: 5_000 })`}
            />

            <p className="mt-5 text-xs text-default-400 text-center max-w-xs leading-relaxed">
              Processors are driven from code too — the caption schedule is
              plain TypeScript. Queue text ahead of time or send it live.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
