import { cn } from "@remavideo/ui";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** Languages the lightweight highlighter understands. */
export type CodeLanguage = "ts" | "bash" | "toml" | "yaml" | "text";

interface Token {
  text: string;
  className: string;
}

const TS_KEYWORDS =
  /\b(import|from|export|default|const|let|var|await|async|function|return|new|type|interface|extends|implements|if|else|for|of|in|true|false|null|undefined|void|process)\b/;

const PATTERNS: Record<
  Exclude<CodeLanguage, "text">,
  { regex: RegExp; classFor: (match: RegExpExecArray) => string }
> = {
  ts: {
    regex: new RegExp(
      [
        String.raw`(\/\/.*$)`, // 1 comment
        String.raw`("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\x60(?:[^\x60\\]|\\.)*\x60)`, // 2 string
        String.raw`\b(\d[\d_]*(?:\.\d+)?)\b`, // 3 number
        TS_KEYWORDS.source, // 4 keyword
      ].join("|"),
      "gm",
    ),
    classFor: (m) => {
      if (m[1] !== undefined) return "tok-com";
      if (m[2] !== undefined) return "tok-str";
      if (m[3] !== undefined) return "tok-num";
      return "tok-key";
    },
  },
  bash: {
    regex: new RegExp(
      [
        "(#.*$)",
        String.raw`("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')`,
        String.raw`(\s--?[\w-]+)`,
      ].join("|"),
      "gm",
    ),
    classFor: (m) => {
      if (m[1] !== undefined) return "tok-com";
      if (m[2] !== undefined) return "tok-str";
      return "tok-num";
    },
  },
  toml: {
    regex: new RegExp(
      [
        "(#.*$)",
        String.raw`("(?:[^"\\]|\\.)*")`,
        String.raw`^(\s*\[\[?[\w.-]+\]?\])`,
      ].join("|"),
      "gm",
    ),
    classFor: (m) => {
      if (m[1] !== undefined) return "tok-com";
      if (m[2] !== undefined) return "tok-str";
      return "tok-key";
    },
  },
  yaml: {
    regex: new RegExp(
      [
        "(#.*$)",
        String.raw`("(?:[^"\\]|\\.)*")`,
        String.raw`^(\s*[\w-]+:)`,
      ].join("|"),
      "gm",
    ),
    classFor: (m) => {
      if (m[1] !== undefined) return "tok-com";
      if (m[2] !== undefined) return "tok-str";
      return "tok-key";
    },
  },
};

/** Tokenizes source code with a small regex grammar — enough for docs. */
function tokenize(code: string, language: CodeLanguage): Token[] {
  if (language === "text") return [{ text: code, className: "" }];
  const { regex, classFor } = PATTERNS[language];
  const tokens: Token[] = [];
  let last = 0;
  regex.lastIndex = 0;
  let match = regex.exec(code);
  while (match !== null) {
    if (match.index > last) {
      tokens.push({ text: code.slice(last, match.index), className: "" });
    }
    tokens.push({ text: match[0], className: classFor(match) });
    last = match.index + match[0].length;
    match = regex.exec(code);
  }
  if (last < code.length)
    tokens.push({ text: code.slice(last), className: "" });
  return tokens;
}

const TOKEN_STYLES: Record<string, string> = {
  "tok-com": "text-[#827968] italic",
  "tok-str": "text-[#b9d99a]",
  "tok-num": "text-[#e9c47e]",
  "tok-key": "text-[#ff9d6b]",
};

/**
 * A "screen" code block: always dark like a video monitor, with a copy
 * button and lightweight syntax highlighting. Identical in both themes.
 */
export function CodeBlock({
  code,
  filename,
  language = "ts",
  className,
}: {
  code: string;
  filename?: string;
  language?: CodeLanguage;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const trimmed = code.trim();

  const copy = () => {
    void navigator.clipboard.writeText(trimmed).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden border border-screen-line bg-screen my-5 group shadow-[0_12px_32px_-16px_rgba(20,14,8,0.5)]",
        className,
      )}
    >
      {filename !== undefined && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-screen-raised border-b border-screen-line">
          <span className="w-2 h-2 rounded-full bg-[#ff7a42]" />
          <span className="text-xs text-[#a2967f] font-mono">{filename}</span>
        </div>
      )}
      <pre className="px-5 py-4 overflow-x-auto text-[13px] leading-relaxed text-[#e9e2d2] font-mono whitespace-pre">
        {tokenize(trimmed, language).map((token, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static token list
            key={i}
            className={TOKEN_STYLES[token.className]}
          >
            {token.text}
          </span>
        ))}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className={cn(
          "absolute top-2.5 right-2.5 p-1.5 rounded-md transition-all",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          "bg-white/[0.06] hover:bg-white/[0.12] text-[#a2967f] hover:text-[#f3eee3]",
        )}
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  );
}
