const problems = [
  {
    number: "01",
    title: "Realtime video plumbing is brutal.",
    body: "Ingest, demux, route, mux, deliver — every live workflow turns into a jungle of FFmpeg flags, process supervision, and reconnect logic. The orchestration code grows faster than the product it serves.",
  },
  {
    number: "02",
    title: "Compliance raises the bar again.",
    body: "The ADA and FCC mandate captions on a wide range of live US broadcast content. Injecting CEA-608 data into H.264 NAL units frame-accurately is bit-level work — most teams try once, ship broken captions, and quietly give up.",
  },
  {
    number: "03",
    title: "Vendor solutions are black boxes.",
    body: "Hosted video APIs hide the pipeline behind opaque endpoints. You can't customise routing, timing, or formats — and you can't run them on your own infrastructure.",
  },
];

export function Problem() {
  return (
    <section className="py-24 border-t border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: section heading */}
          <div className="lg:col-span-4">
            <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
              THE PROBLEM
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground leading-[1.08]">
              Live video infrastructure is hard. It shouldn't be.
            </h2>
          </div>

          {/* Right: numbered editorial list */}
          <div className="lg:col-span-8 flex flex-col divide-y divide-divider">
            {problems.map((p) => (
              <div
                key={p.number}
                className="group flex gap-6 sm:gap-10 py-8 first:pt-0 last:pb-0"
              >
                <span className="font-mono text-sm text-primary pt-1 tabular-nums">
                  {p.number}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-default-500 leading-relaxed max-w-xl">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
