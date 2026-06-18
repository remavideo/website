import { Button } from "@heroui/react";
import { ArrowRight, Check } from "lucide-react";

interface TierDef {
  name: string;
  price: string;
  sub: string;
  description: string;
  cta: string;
  ctaHref: string;
  external?: boolean;
  popular: boolean;
  features: string[];
}

const tiers: TierDef[] = [
  {
    name: "Open Source",
    price: "Free",
    sub: "Self-hosted, forever",
    description:
      "Run rema on your own server. All core features included, full source on GitHub.",
    cta: "Get the code",
    ctaHref: "https://github.com/fabrizio/rema",
    external: true,
    popular: false,
    features: [
      "All pipeline node types",
      "CEA-608 / CEA-708 caption injection",
      "RTMP, SRT, HLS, and file I/O",
      "Live dashboard",
      "Community support",
    ],
  },
  {
    name: "Cloud",
    price: "Coming soon",
    sub: "Join the waitlist",
    description:
      "Hosted rema infrastructure. Push your stream, schedule your captions, pay per stream-hour. No ops required.",
    cta: "Join waitlist",
    ctaHref: "#waitlist",
    popular: true,
    features: [
      "Everything in Open Source",
      "Managed infrastructure",
      "Per stream-hour billing",
      "99.9% uptime SLA",
      "Priority support",
      "Usage metrics dashboard",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "On-premise license",
    description:
      "Deploy rema inside your infrastructure with a commercial license, dedicated support, and an SLA.",
    cta: "Contact us",
    ctaHref: "mailto:fabrizio.ruggeri@gmail.com",
    popular: false,
    features: [
      "Everything in Open Source",
      "Commercial license",
      "On-premise deployment",
      "Dedicated support",
      "Custom SLA",
      "Integration assistance",
    ],
  },
];

function TierCard({ tier }: { tier: TierDef }) {
  return (
    <div
      className={`relative rounded-2xl border p-7 flex flex-col gap-6 bg-background ${
        tier.popular
          ? "border-primary shadow-[0_20px_50px_-20px_rgba(216,69,18,0.4)] lg:-mt-4 lg:pb-11"
          : "border-divider"
      }`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-7 caption-bar rounded-[3px] px-2.5 py-1 text-[10px] tracking-[0.15em]">
          MOST POPULAR
        </span>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-default-400 mb-3">
          {tier.name}
        </p>
        <div className="font-display text-3xl font-bold text-foreground mb-1">
          {tier.price}
        </div>
        <p className="text-xs text-default-400">{tier.sub}</p>
      </div>

      <p className="text-sm text-default-500 leading-relaxed">
        {tier.description}
      </p>

      <ul className="space-y-2.5 flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-default-600"
          >
            <Check size={14} className="mt-0.5 text-primary flex-none" />
            {f}
          </li>
        ))}
      </ul>

      <Button
        as="a"
        href={tier.ctaHref}
        {...(tier.external === true
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        color={tier.popular ? "primary" : "default"}
        variant={tier.popular ? "solid" : "bordered"}
        fullWidth
        className={`font-semibold ${
          tier.popular
            ? ""
            : "border-default-300 text-default-600 hover:text-foreground"
        }`}
        endContent={tier.popular ? <ArrowRight size={15} /> : undefined}
      >
        {tier.cta}
      </Button>
    </div>
  );
}

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-28 bg-content1/60 border-y border-divider relative grain"
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-6">
            PRICING
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground mb-4 leading-[1.08]">
            Start free. Scale when you're ready.
          </h2>
          <p className="text-default-500 text-lg max-w-xl mx-auto">
            The core engine is open source — always. Hosted infrastructure and
            enterprise support are there when you need them.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {tiers.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>
      </div>
    </section>
  );
}
