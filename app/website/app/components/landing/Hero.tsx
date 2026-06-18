import { Button } from "@heroui/react";
import { ArrowRight, Github } from "lucide-react";
import { CodeBlock } from "../code/CodeBlock";
import { CaptionMonitor } from "./CaptionMonitor";

const stats = [
  { value: "RTMP · SRT · HLS", label: "Protocols" },
  { value: "None", label: "Re-encoding" },
  { value: "< 1 frame", label: "Caption latency" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Halftone backdrop, fading out downward */}
      <div
        className="absolute inset-0 dot-field text-foreground/[0.06] [mask-image:linear-gradient(to_bottom,black,transparent_75%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 lg:pt-28 lg:pb-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-6">
            <p className="rise-in rise-in-1 caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-7">
              ● ON AIR — REALTIME MEDIA PIPELINES
            </p>

            <h1 className="rise-in rise-in-2 font-display text-[2.9rem] sm:text-6xl font-extrabold tracking-tight leading-[1.02] mb-6 text-foreground">
              Live video
              <br />
              pipelines, written
              <br />
              in <span className="text-primary">TypeScript.</span>
            </h1>

            <p className="rise-in rise-in-3 text-lg text-default-500 leading-relaxed mb-10 max-w-md">
              Rema is a node-graph media server. Compose inputs, processors, and
              outputs in code — ingest RTMP or SRT, route and transform streams,
              inject broadcast-grade captions, deliver to HLS, RTMP, or disk.
            </p>

            <div className="rise-in rise-in-4 flex flex-wrap items-center gap-3">
              <Button
                as="a"
                href="#waitlist"
                color="primary"
                size="lg"
                className="font-semibold px-7"
                endContent={<ArrowRight size={16} />}
              >
                Get early access
              </Button>
              <Button
                isDisabled
                variant="bordered"
                size="lg"
                className="font-medium border-default-300 text-default-400"
                startContent={<Github size={16} />}
              >
                Self-host — coming soon
              </Button>
            </div>

            {/* Stats strip */}
            <div className="rise-in rise-in-5 mt-14 flex items-center gap-10 pt-7 border-t border-divider">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-default-400 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: the program monitor + the pipeline that feeds it */}
          <div className="lg:col-span-6 rise-in rise-in-3">
            <CaptionMonitor />
            <CodeBlock
              className="mt-4 !my-0 hidden sm:block"
              code={`const input    = await wf.input.rtmpReader({ app: "live", sourceName: "stage" })
const captions = await wf.processor.cea608()
const output   = await wf.output.rtmp({ url: "rtmp://cdn.example.com/live/key" })`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
