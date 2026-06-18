import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { RemaLogo, ThemeToggle } from "@remavideo/ui";
import { Link as RouterLink } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { dashboardUrl, isDashboardOff } from "../../lib/flags";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function MarketingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Signal strip — the site's broadcast signature */}
      <div className="smpte-strip h-[3px] w-full" aria-hidden="true" />
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        classNames={{
          base: "bg-background/85 backdrop-blur-md border-b border-divider sticky top-0 z-50",
          wrapper: "max-w-6xl",
        }}
        maxWidth="full"
      >
        <NavbarContent justify="start">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <RouterLink to="/">
              <RemaLogo size="md" />
            </RouterLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-8" justify="center">
          {navLinks.map((link) => (
            <NavbarItem key={link.href}>
              <Link
                as={RouterLink}
                to={link.href}
                className="text-default-500 hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
          {!isDashboardOff && (
            <NavbarItem>
              <Button
                as="a"
                href={dashboardUrl}
                color="primary"
                size="sm"
                className="font-semibold"
                endContent={<ArrowUpRight size={14} />}
              >
                Dashboard
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarMenu className="bg-background/95 backdrop-blur-md pt-6 gap-4">
          {navLinks.map((link) => (
            <NavbarMenuItem key={link.href}>
              <Link
                as={RouterLink}
                to={link.href}
                className="text-foreground text-lg font-medium"
                onPress={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </NavbarMenuItem>
          ))}
          {!isDashboardOff && (
            <NavbarMenuItem>
              <Button
                as="a"
                href={dashboardUrl}
                color="primary"
                fullWidth
                className="mt-2 font-semibold"
                onPress={() => setIsMenuOpen(false)}
              >
                Open Dashboard
              </Button>
            </NavbarMenuItem>
          )}
        </NavbarMenu>
      </Navbar>
    </>
  );
}
