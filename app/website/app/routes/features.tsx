import { createFileRoute } from "@tanstack/react-router";
import {
  Binary,
  Boxes,
  Cable,
  Code2,
  Cpu,
  FileVideo,
  GitMerge,
  Network,
  Radio,
  Subtitles,
  Terminal,
  Zap,
} from "lucide-react";
import { Footer } from "../components/layout/Footer";
import { MarketingNav } from "../components/layout/MarketingNav";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
});

const sections = [
  {
    tag: "PIPELINE MODEL",
    title: "Code is your pipeline",
    description:
      "rema treats your TypeScript program as a live pipeline declaration. Every node you create registers on the server; every subscribe call wires the graph together.",
    items: [
      {
        icon: Network,
        title: "Directed acyclic graph",
        body: "Nodes form a DAG. The server resolves subscription order and manages FFmpeg process lifecycle automatically.",
      },
      {
        icon: GitMerge,
        title: "Multi-source fan-in",
        body: "A single output node can subscribe to multiple inputs. The server handles muxing transparently via FFmpeg.",
      },
      {
        icon: Boxes,
        title: "Workflow isolation",
        body: "Each SDK client creates its own workflow namespace. Multiple pipelines run independently on the same server.",
      },
      {
        icon: Cable,
        title: "tRPC/WebSocket protocol",
        body: "All SDK↔server communication uses tRPC over a single WebSocket. The AppRouter type is the single source of truth — no codegen, no .proto.",
      },
    ],
  },
  {
    tag: "MEDIA I/O",
    title: "Any source, any destination",
    description:
      "rema supports the full range of broadcast and developer-friendly protocols. MediaMTX handles ingress; FFmpeg handles everything else.",
    items: [
      {
        icon: Radio,
        title: "RTMP & SRT ingest",
        body: "MediaMTX listens on port 1935 (RTMP) and notifies the server via HTTP hooks when a publisher connects or disconnects.",
      },
      {
        icon: FileVideo,
        title: "File input & loop",
        body: "Feed video files (MP4, MKV, TS) directly into the pipeline. Loop mode re-reads the file infinitely for test streams.",
      },
      {
        icon: Zap,
        title: "Low-latency RTMP output",
        body: "Output to any RTMP endpoint — Twitch, YouTube, local MediaMTX relay, or custom ingest. Sub-second glass-to-glass latency.",
      },
      {
        icon: Terminal,
        title: "Internal RTSP relay",
        body: "The caption path routes modified MPEG-TS through an internal RTSP relay on port 8554 before FFmpeg picks it up for output.",
      },
    ],
  },
  {
    tag: "CAPTION PIPELINE",
    title: "Broadcast-grade captions",
    description:
      "rema implements a complete CEA-608/708 caption injection pipeline in TypeScript. Text is scheduled, encoded, and injected into live H.264 bitstreams without re-encoding.",
    items: [
      {
        icon: Subtitles,
        title: "CEA-608 encoding",
        body: "Text is converted to CC byte pairs with correct odd-parity encoding per the ANSI/CEA-608 spec. All 64 displayable characters are supported.",
      },
      {
        icon: Binary,
        title: "CEA-708 framing",
        body: "CC byte pairs are framed into DTVCC service blocks (CEA-708-E). Service 1 is used for primary captions.",
      },
      {
        icon: Cpu,
        title: "SEI NAL injection",
        body: "A SMPTE 334M SEI payload is assembled and injected before the first VCL NAL unit in each key frame — no transcode required.",
      },
      {
        icon: Code2,
        title: "Timed caption schedule",
        body: "CaptionSourceNode exposes a .send() API. Queue text with precise timing and rema drains the schedule at the correct frame boundary.",
      },
    ],
  },
];

function FeatureSection({ section }: { section: (typeof sections)[number] }) {
  return (
    <section className="py-20 border-b border-divider last:border-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: heading */}
          <div className="lg:col-span-1">
            <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-5">
              {section.tag}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4 leading-[1.1]">
              {section.title}
            </h2>
            <p className="text-default-500 leading-relaxed text-sm">
              {section.description}
            </p>
          </div>

          {/* Right: ruled items grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px bg-divider border border-divider rounded-2xl overflow-hidden">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-background hover:bg-content1 transition-colors p-6"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon size={16} />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-default-500 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 overflow-hidden border-b border-divider">
          <div
            className="absolute inset-0 dot-field text-foreground/[0.06] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
              UNDER THE HOOD
            </p>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground mb-6">
              How rema is built
            </h1>
            <p className="text-xl text-default-500 max-w-2xl mx-auto leading-relaxed">
              A deep dive into the pipeline model, media I/O capabilities, and
              the broadcast-grade caption injection engine.
            </p>
          </div>
        </section>

        {/* Feature sections */}
        {sections.map((section) => (
          <FeatureSection key={section.tag} section={section} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
