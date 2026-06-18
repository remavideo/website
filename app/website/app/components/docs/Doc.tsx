import { cn } from "@remavideo/ui";
import { type ReactNode, useEffect, useState } from "react";

export { CodeBlock } from "../code/CodeBlock";

/** Inline code chip. */
export function IC({ children }: { children: string }) {
  return (
    <code className="font-mono text-[0.85em] bg-content1 border border-divider px-1.5 py-0.5 rounded text-primary whitespace-nowrap">
      {children}
    </code>
  );
}

/** Top-level docs section heading with a hoverable anchor link. */
export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="group font-display text-2xl font-bold text-foreground mt-16 mb-5 scroll-mt-8 border-b border-divider pb-3"
    >
      <a href={`#${id}`} className="hover:text-primary transition-colors">
        {children}
      </a>
      <span
        aria-hidden="true"
        className="ml-2 text-primary/0 group-hover:text-primary/60 transition-colors font-normal select-none"
      >
        #
      </span>
    </h2>
  );
}

/** Docs subsection heading. */
export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="font-display text-lg font-bold text-foreground mt-10 mb-3 scroll-mt-8"
    >
      {children}
    </h3>
  );
}

/** A code-styled node-factory name inside an H3, e.g. wf.input.file(). */
export function FnName({ children }: { children: string }) {
  return (
    <span className="font-mono text-[0.95em] text-primary">{children}</span>
  );
}

/** Docs body paragraph. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-default-600 leading-[1.75] mb-4 max-w-[70ch]">
      {children}
    </p>
  );
}

/** Note / warning / tip box. */
export function Callout({
  variant,
  children,
}: {
  variant: "info" | "warning" | "tip";
  children: ReactNode;
}) {
  const styles = {
    info: "border-secondary/40 bg-secondary/[0.06] [&>strong]:text-secondary",
    warning: "border-warning/40 bg-warning/[0.06] [&>strong]:text-warning",
    tip: "border-success/40 bg-success/[0.06] [&>strong]:text-success",
  };
  const labels = { info: "NOTE", warning: "WARNING", tip: "TIP" };

  return (
    <div
      className={cn(
        "border rounded-xl px-4 py-3 my-5 text-sm leading-relaxed text-default-600",
        styles[variant],
      )}
    >
      <strong className="font-mono text-[11px] tracking-[0.15em] mr-2">
        {labels[variant]}
      </strong>
      {children}
    </div>
  );
}

interface PropDef {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description: string;
}

/** Settings table for a node factory or options object. */
export function PropTable({ props }: { props: PropDef[] }) {
  return (
    <div className="overflow-x-auto my-5 rounded-xl border border-divider">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-divider bg-content1">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                className="text-left py-2.5 px-4 text-default-500 font-mono text-[11px] tracking-[0.12em] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr
              key={prop.name}
              className="border-b border-divider last:border-0 even:bg-content1/40"
            >
              <td className="py-3 px-4 align-top">
                <code className="font-mono text-xs text-primary font-semibold">
                  {prop.name}
                </code>
                {prop.required === true && (
                  <span className="ml-1 text-danger text-xs" title="Required">
                    *
                  </span>
                )}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-secondary leading-relaxed align-top max-w-56">
                {prop.type}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-default-400 align-top whitespace-nowrap">
                {prop.default ?? "—"}
              </td>
              <td className="py-3 px-4 text-default-600 text-[13px] leading-relaxed align-top">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Plain data table (ports, sizing guides, …). */
export function DataTable({
  headers,
  rows,
  mono = [0],
}: {
  headers: string[];
  rows: string[][];
  /** Column indexes rendered in mono/primary, default first column. */
  mono?: number[];
}) {
  return (
    <div className="overflow-x-auto my-5 rounded-xl border border-divider">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-divider bg-content1">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-2.5 px-4 text-default-500 font-mono text-[11px] tracking-[0.12em] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.join("|")}
              className="border-b border-divider last:border-0 even:bg-content1/40"
            >
              {row.map((cell, i) => (
                <td
                  key={`${headers[i] ?? i}-${cell}`}
                  className={cn(
                    "py-3 px-4 text-[13px] leading-relaxed align-top",
                    mono.includes(i)
                      ? "font-mono text-xs text-primary"
                      : "text-default-600",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface TocSection {
  id: string;
  label: string;
  children: { id: string; label: string }[];
}

/** Sticky on-page table of contents with scroll-spy highlighting. */
export function DocToc({ toc }: { toc: TocSection[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const ids = toc.flatMap((s) => [s.id, ...s.children.map((c) => c.id)]);
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first !== undefined) setActiveId(first.target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [toc]);

  return (
    <aside className="hidden xl:block w-56 flex-shrink-0">
      <nav className="sticky top-8 flex flex-col">
        <p className="font-mono text-[10px] tracking-[0.18em] text-default-400 px-2 mb-3">
          ON THIS PAGE
        </p>
        {toc.map((section) => (
          <div key={section.id} className="mb-3">
            <a
              href={`#${section.id}`}
              className={cn(
                "block px-2 py-1 text-[13px] font-semibold transition-colors border-l-2",
                activeId === section.id
                  ? "text-primary border-primary"
                  : "text-default-600 border-transparent hover:text-foreground",
              )}
            >
              {section.label}
            </a>
            {section.children.map((child) => (
              <a
                key={child.id}
                href={`#${child.id}`}
                className={cn(
                  "block px-4 py-[3px] text-xs transition-colors border-l-2",
                  activeId === child.id
                    ? "text-primary border-primary"
                    : "text-default-400 border-divider hover:text-foreground",
                )}
              >
                {child.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/** Page shell: hero header, content column, and the sticky TOC. */
export function DocPage({
  eyebrow,
  title,
  intro,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  toc: TocSection[];
  children: ReactNode;
}) {
  return (
    <div className="flex gap-10 px-6 py-12 max-w-6xl mx-auto w-full">
      <article className="flex-1 min-w-0">
        <div className="mb-12">
          <p className="caption-bar inline-block rounded-[3px] px-2.5 py-1 text-[11px] tracking-[0.18em] mb-5">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-default-500 text-lg leading-relaxed max-w-[60ch]">
            {intro}
          </p>
        </div>
        {children}
        <div className="h-20" />
      </article>
      <DocToc toc={toc} />
    </div>
  );
}
