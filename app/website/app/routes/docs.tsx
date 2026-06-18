import { cn } from "@remavideo/ui";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { BookOpen, Server } from "lucide-react";
import { MarketingNav } from "../components/layout/MarketingNav";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

function NavLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "text-primary bg-primary/10 font-semibold"
          : "text-default-500 hover:text-foreground hover:bg-content1",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function DocsLayout() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <MarketingNav />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col flex-shrink-0 w-56 border-r border-divider overflow-y-auto">
          <nav className="flex flex-col gap-1 p-4 pt-8">
            <p className="font-mono text-[10px] tracking-[0.18em] text-default-400 px-3 mb-3">
              DOCUMENTATION
            </p>
            <NavLink
              to="/docs"
              icon={<BookOpen size={14} />}
              label="SDK Guide"
            />
            <NavLink
              to="/docs/deployment"
              icon={<Server size={14} />}
              label="Deployment"
            />
          </nav>
        </aside>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
