import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Clock,
  Package,
  ScanLine,
  Search,
  ShieldAlert,
  TriangleAlert,
  CircleCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findMedicineById } from "@/data/medicines";
import { expiryStatus, useAppState } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Health Navigator Dashboard — MediLens AI" },
      {
        name: "description",
        content:
          "Your MediLens health dashboard: track scans, monitor medicine expiry, and manage your cabinet.",
      },
      { property: "og:title", content: "Health Navigator Dashboard — MediLens AI" },
      {
        property: "og:description",
        content: "Track recent scans, expiring medicines and your cabinet at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

const STATUS_LABEL = {
  valid: "Valid",
  expiring: "Expiring soon",
  expired: "Expired",
} as const;

function statusBadgeClass(status: "valid" | "expiring" | "expired") {
  return status === "expired"
    ? "bg-destructive text-destructive-foreground"
    : status === "expiring"
      ? "bg-warning text-warning-foreground"
      : "bg-success text-success-foreground";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { user, cabinet, history } = useAppState();

  const expiringSoon = cabinet.filter((item) => {
    const t = new Date(item.expiry).getTime();
    if (Number.isNaN(t)) return false;
    const days = (t - Date.now()) / 86_400_000;
    return days >= 0 && days <= 30;
  }).length;
  const expired = cabinet.filter((item) => expiryStatus(item.expiry) === "expired").length;

  const metrics = [
    {
      label: "Medicines in cabinet",
      value: cabinet.length,
      icon: Package,
      className: "bg-accent text-accent-foreground",
    },
    {
      label: "Recent scans",
      value: history.length,
      icon: Activity,
      className: "bg-secondary text-secondary-foreground",
    },
    {
      label: "Expiring within 30 days",
      value: expiringSoon,
      icon: Clock,
      className: "bg-warning text-warning-foreground",
    },
    {
      label: "Expired medicines",
      value: expired,
      icon: TriangleAlert,
      className: "bg-destructive text-destructive-foreground",
    },
  ];

  const recentScans = history.slice(0, 5);
  const recentCabinet = cabinet.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {/* Welcome */}
      <section className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {greeting()}
            {user ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            {user
              ? "Here's an overview of your medicines, scans and expiry alerts."
              : "Welcome to MediLens AI. Scan a medicine to understand what you're taking — sign in anytime to personalise your experience."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/scan">
                <ScanLine className="size-4" />
                Scan Medicine
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">
                <Search className="size-4" />
                Search Medicines
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/cabinet">View Cabinet</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 py-5">
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${m.className}`}
              >
                <m.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-semibold tabular-nums">{m.value}</p>
                <p className="truncate text-xs text-muted-foreground">{m.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recently scanned */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Recently scanned medicines</CardTitle>
            {recentScans.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/scan">
                  Scan again <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <ScanLine className="size-7" />
                </span>
                <p className="font-medium">No scans yet</p>
                <p className="text-sm text-muted-foreground">
                  Scan a medicine package to see its full profile here.
                </p>
                <Button asChild className="mt-1">
                  <Link to="/scan">Scan your first medicine</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentScans.map((scan) => {
                  const med = findMedicineById(scan.medicineId);
                  return (
                    <li key={scan.id}>
                      <Link
                        to="/analysis/$id"
                        params={{ id: scan.id }}
                        className="flex items-center gap-3 py-3 transition-colors hover:bg-accent/50 rounded-md px-2 -mx-2"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <ScanLine className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {med?.brandName ?? scan.extraction?.medicineName ?? "Unrecognised medicine"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scan.scannedAt).toLocaleString()} · {scan.confidence}%
                            confidence
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Cabinet preview */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">My medicine cabinet</CardTitle>
            {recentCabinet.length > 0 && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/cabinet">
                  View all in Cabinet <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentCabinet.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Package className="size-7" />
                </span>
                <p className="font-medium">Your cabinet is empty</p>
                <p className="text-sm text-muted-foreground">
                  Save scanned medicines to track their expiry dates.
                </p>
                <Button asChild variant="outline" className="mt-1">
                  <Link to="/scan">Scan a medicine</Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentCabinet.map((item) => {
                  const med = findMedicineById(item.medicineId);
                  const status = expiryStatus(item.expiry);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-shadow hover:shadow-sm"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        {status === "valid" ? (
                          <CircleCheck className="size-4" />
                        ) : (
                          <Clock className="size-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.brandName}</p>
                        <p className="text-xs text-muted-foreground">
                          {[med?.dosage, med?.form].filter(Boolean).join(" · ") ||
                            "Saved medicine"}
                        </p>
                      </div>
                      <Badge className={statusBadgeClass(status)}>{STATUS_LABEL[status]}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="mt-8 border-warning/50 bg-warning/10">
        <CardContent className="flex items-start gap-3 py-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
          <p className="text-sm text-warning-foreground">
            MediLens AI provides educational information only and is not a substitute for
            professional medical advice, diagnosis or treatment. Always consult a qualified doctor
            or pharmacist before starting, stopping or changing any medicine.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
