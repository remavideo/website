import { Building2, Clapperboard, Rocket } from "lucide-react";

const cases = [
  {
    icon: Clapperboard,
    tag: "LIVE EVENTS",
    headline: "Caption your conference, concert, or sports broadcast.",
    body: "ADA compliance for live events isn't optional — it's expected. Inject timed captions from a simple schedule with no camera-side hardware changes, using any RTMP-capable encoder on site.",
    detail: "Conferences · Sports · Houses of worship · Town halls",
  },
  {
    icon: Rocket,
    tag: "STREAMING STARTUPS",
    headline:
      "Ship a compliant streaming product without operating FFmpeg clusters.",
    body: "If you're building a live video product, you'll need caption support sooner than you think. Rema gives you a programmable pipeline API so you can focus on your product, not on bitstream manipulation.",
    detail: "Live commerce · Fitness · Virtual events · Creator platforms",
  },
  {
    icon: Building2,
    tag: "BROADCASTERS",
    headline: "Replace your media pipeline with one you actually control.",
    body: "Self-host rema on your own infrastructure. Full source access, no vendor dependency, no black-box behavior — the same open-source engine powers self-hosted and cloud, so you're never locked in.",
    detail: "Local TV · Digital broadcasters · IPTV · Production houses",
  },
];

export function UseCases() {
  return (
    <section className="py-28 border-t border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-16">
          <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
            WHO IT'S FOR
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4 leading-[1.08]">
            Three kinds of teams. One tool.
          </h2>
          <p className="text-default-500 text-lg">
            Whether you're running a single live event or building a
            multi-tenant streaming platform, rema fits how you work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {cases.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.tag}
                className="group rounded-2xl border border-divider bg-content1/60 p-7 flex flex-col gap-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={18} />
                  </div>
                  <span className="caption-bar rounded-[3px] px-2 py-0.5 text-[10px] tracking-[0.15em]">
                    {c.tag}
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground text-lg leading-snug">
                  {c.headline}
                </h3>
                <p className="text-sm text-default-500 leading-relaxed flex-1">
                  {c.body}
                </p>
                <div className="pt-3 border-t border-divider">
                  <p className="text-xs text-default-400">{c.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
