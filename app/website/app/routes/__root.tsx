import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider, themeInitScript } from "@remavideo/ui";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "rema — Composable realtime video pipelines in TypeScript" },
      {
        name: "description",
        content:
          "Rema is a node-graph media server: ingest RTMP/SRT, route and transform live streams, inject broadcast-grade CEA-608/708 captions, and output to HLS, RTMP, or disk — all declared in TypeScript.",
      },
    ],
    links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    scripts: [{ children: themeInitScript }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen">
        <ThemeProvider>
          <HeroUIProvider>{children}</HeroUIProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
