import { Link } from "@heroui/react";
import { RemaLogo } from "@remavideo/ui";
import { Link as RouterLink } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { dashboardUrl, isDashboardOff } from "../../lib/flags";

const footerLinks = [
  {
    group: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/docs", label: "Documentation" },
      ...(isDashboardOff
        ? []
        : [{ href: dashboardUrl, label: "Dashboard", external: true }]),
    ],
  },
  {
    group: "Resources",
    links: [
      {
        href: "https://github.com/fabrizio/rema",
        label: "GitHub",
        external: true,
      },
      { href: "/docs/deployment", label: "Deployment guide" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-divider bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <RouterLink to="/">
              <RemaLogo size="md" />
            </RouterLink>
            <p className="mt-4 text-sm text-default-500 max-w-xs leading-relaxed">
              A realtime media server for composable video pipelines — ingest,
              transform, caption, and deliver live streams from TypeScript. Open
              source and self-hostable.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="https://github.com/fabrizio/rema"
                isExternal
                className="text-default-400 hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-wider text-default-400 mb-4">
                {group.group}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <Link
                        href={link.href}
                        isExternal
                        className="text-sm text-default-500 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <RouterLink
                        to={link.href}
                        className="text-sm text-default-500 hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </RouterLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-divider flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-default-400">
            © {new Date().getFullYear()} rema. Open source under MIT.
          </p>
          <p className="caption-bar rounded px-2.5 py-1 text-[11px] tracking-wide">
            BUILT WITH TYPESCRIPT &amp; FFMPEG
          </p>
        </div>
      </div>
      {/* Closing signal strip */}
      <div className="smpte-strip h-[3px] w-full" aria-hidden="true" />
    </footer>
  );
}
