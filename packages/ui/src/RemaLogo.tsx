import { useId } from "react";
import { cn } from "./utils.js";

interface RemaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  wordmark?: boolean;
}

const sizes = {
  sm: { glyph: { width: 24, height: 17 }, text: "text-base" },
  md: { glyph: { width: 30, height: 21 }, text: "text-lg" },
  lg: { glyph: { width: 44, height: 31 }, text: "text-2xl" },
};

/**
 * The pipeline-graph glyph: two input nodes fan in to the central rema
 * node, which feeds a play-triangle output — composable media pipelines,
 * in the brand's vermilion-to-amber gradient.
 */
function PipelineGraphGlyph({
  width,
  height,
  className,
}: {
  width?: number | undefined;
  height?: number | undefined;
  className?: string | undefined;
}) {
  const uid = useId();
  const grad = `rema-g-${uid}`;
  return (
    <svg
      viewBox="0 0 34 24"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={grad}
          x1="0"
          y1="0"
          x2="34"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#e04e1a" />
          <stop offset="100%" stopColor="#ffb01f" />
        </linearGradient>
      </defs>
      {/* Fan-in connectors */}
      <path
        d="M9.3 8.3 L11.1 9.3"
        stroke={`url(#${grad})`}
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.3 15.7 L11.1 14.7"
        stroke={`url(#${grad})`}
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Output connector */}
      <path
        d="M22.5 12 L25 12"
        stroke={`url(#${grad})`}
        strokeOpacity="0.8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Input nodes */}
      <circle cx="5" cy="6" r="3" fill={`url(#${grad})`} fillOpacity="0.6" />
      <circle cx="5" cy="18" r="3" fill={`url(#${grad})`} fillOpacity="0.6" />
      {/* Central rema node */}
      <circle cx="16" cy="12" r="5.2" fill={`url(#${grad})`} />
      {/* Play-triangle output */}
      <path
        d="M27 8.2 L32.4 11.6 a0.5 0.5 0 0 1 0 0.8 L27 15.8 a0.5 0.5 0 0 1 -0.75 -0.4 V8.6 a0.5 0.5 0 0 1 0.75 -0.4 Z"
        fill={`url(#${grad})`}
      />
    </svg>
  );
}

/** The rema wordmark: pipeline-graph glyph + "rema" text. */
export function RemaLogo({
  className,
  size = "md",
  wordmark = true,
}: RemaLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <PipelineGraphGlyph width={s.glyph.width} height={s.glyph.height} />
      {wordmark && (
        <span
          className={cn(
            "font-display font-bold tracking-tight leading-none text-foreground",
            s.text,
          )}
        >
          rema
        </span>
      )}
    </div>
  );
}

/** Standalone pipeline-graph glyph without the wordmark. */
export function RemaGlyph({ className }: { className?: string }) {
  return <PipelineGraphGlyph className={className} />;
}
