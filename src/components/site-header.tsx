import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ScanLine, Package, Search, Stethoscope, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scanner", icon: ScanLine },
  { to: "/cabinet", label: "Cabinet", icon: Package },
  { to: "/search", label: "Search", icon: Search },
] as const;

export function SiteHeader() {
  const { language, user } = useAppState();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">MediLens AI</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border p-0.5">
            {(["en", "te"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => actions.setLanguage(code)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                  language === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {code === "en" ? "EN" : "తె"}
              </button>
            ))}
          </div>

          {user ? (
            <Button variant="ghost" size="sm" onClick={() => actions.signOut()}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">{user.name}</span>
            </Button>
          ) : (
            <Button size="sm" onClick={() => actions.signIn("Guest user")}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-border/70 px-4 py-2 sm:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Safety disclaimer</p>
        <p className="mt-1 max-w-3xl">
          MediLens AI provides general information only and is not a substitute for professional
          medical advice, diagnosis or treatment. Always confirm medicine details with the printed
          packaging and consult a qualified doctor or pharmacist before taking any medication.
        </p>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} MediLens AI</p>
      </div>
    </footer>
  );
}
