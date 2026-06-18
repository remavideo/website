import {
  Code2,
  GitBranch,
  Radio,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Describe your pipeline in TypeScript",
    description:
      "Compose inputs, processors, and outputs with code, not dashboards or YAML. Nodes form a graph; rema supervises the FFmpeg processes behind it.",
  },
  {
    icon: Radio,
    title: "Any source in, any destination out",
    description:
      "Ingest RTMP or SRT from OBS, vMix, or hardware encoders. Deliver to RTMP endpoints, multi-rendition HLS on S3, or plain files — fan-in and fan-out included.",
  },
  {
    icon: ShieldCheck,
    title: "FCC-compliant captions, injected live",
    description:
      "CEA-608 and CEA-708 data is written directly into H.264 SEI NAL units. No re-encoding, no quality loss — broadcast-spec output.",
  },
  {
    icon: Zap,
    title: "Sub-second latency on live streams",
    description:
      "Streams are copied, not transcoded. Processing rides the existing bitstream — latency is measured in frames, not seconds.",
  },
  {
    icon: Terminal,
    title: "See every stream, every node, live",
    description:
      "The built-in dashboard shows pipeline topology, node states, and stream health in real time — from any browser.",
  },
  {
    icon: Code2,
    title: "Catch pipeline errors at compile time",
    description:
      "Full type safety from SDK to server. Wrong node kinds, missing subscriptions, and bad config fail before they hit the air.",
  },
];

export function Features() {
  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-16">
          <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
            WHAT YOU GET
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4 leading-[1.08]">
            Built for production, not for demos.
          </h2>
          <p className="text-default-500 text-lg">
            Every feature is designed around the real constraints of live
            broadcast — latency, compliance, and reliability that doesn't break
            on air.
          </p>
        </div>

        {/* Ruled grid — cells share hairline borders like a printed spec sheet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-divider border border-divider rounded-2xl overflow-hidden">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative p-7 bg-background hover:bg-content1 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon size={18} />
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-default-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
