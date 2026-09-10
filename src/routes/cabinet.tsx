import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Package, Pill, Search, ScanLine, Trash2, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { actions, expiryStatus, useAppState, type CabinetItem, type ExpiryStatus } from "@/lib/store";
import { findMedicineById } from "@/data/medicines";

export const Route = createFileRoute("/cabinet")({
  head: () => ({
    meta: [
      { title: "Medicine Cabinet — MediLens AI" },
      {
        name: "description",
        content: "Keep track of the medicines you own and see at a glance which ones are expiring.",
      },
      { property: "og:title", content: "Medicine Cabinet — MediLens AI" },
      {
        property: "og:description",
        content: "Your saved medicines with colour-coded expiry tracking.",
      },
    ],
  }),
  component: CabinetPage,
});

const STATUS_META: Record<ExpiryStatus, { label: string; badgeClass: string }> = {
  valid: { label: "Valid", badgeClass: "bg-success text-success-foreground" },
  expiring: { label: "Expiring soon", badgeClass: "bg-warning text-warning-foreground" },
  expired: { label: "Expired", badgeClass: "bg-destructive text-destructive-foreground" },
};

type Filter = "all" | ExpiryStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "valid", label: "Valid" },
  { value: "expiring", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
];

function formatExpiry(expiry: string) {
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return expiry;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function CabinetPage() {
  const { cabinet } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const enriched = useMemo(
    () =>
      cabinet.map((item) => ({
        item,
        status: expiryStatus(item.expiry),
        medicine: findMedicineById(item.medicineId),
      })),
    [cabinet],
  );

  const counts = useMemo(
    () => ({
      total: enriched.length,
      valid: enriched.filter((e) => e.status === "valid").length,
      expiring: enriched.filter((e) => e.status === "expiring").length,
      expired: enriched.filter((e) => e.status === "expired").length,
    }),
    [enriched],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter(({ item, status, medicine }) => {
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      return [item.brandName, medicine?.manufacturer ?? "", ...(medicine?.activeIngredients ?? [])]
        .some((f) => f.toLowerCase().includes(q));
    });
  }, [enriched, query, filter]);

  const summary = [
    { key: "total", label: "Total medicines", value: counts.total, icon: Pill, className: "text-primary" },
    { key: "valid", label: "Valid", value: counts.valid, icon: Package, className: "text-success" },
    { key: "expiring", label: "Expiring soon", value: counts.expiring, icon: CalendarClock, className: "text-warning" },
    { key: "expired", label: "Expired", value: counts.expired, icon: TriangleAlert, className: "text-destructive" },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Medicine cabinet</h1>
          <p className="mt-2 text-muted-foreground">
            {counts.total} {counts.total === 1 ? "medicine" : "medicines"} saved ·{" "}
            {counts.expiring + counts.expired > 0
              ? `${counts.expiring + counts.expired} need${counts.expiring + counts.expired === 1 ? "s" : ""} attention`
              : "all within expiry"}
          </p>
        </div>
        <Button asChild>
          <Link to="/scan">
            <ScanLine className="size-4" />
            Scan medicine
          </Link>
        </Button>
      </div>

      {cabinet.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Package className="size-8" />
            </span>
            <p className="text-lg font-medium">Your cabinet is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Scan a medicine and save it here to keep track of what you own and when it expires.
            </p>
            <Button asChild className="mt-2">
              <Link to="/scan">
                <ScanLine className="size-4" />
                Scan Medicine
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summary.map((s) => (
              <Card key={s.key} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 py-4">
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted", s.className)}>
                    <s.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold leading-none">{s.value}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, ingredient or manufacturer…"
                aria-label="Search your cabinet"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by expiry status">
              {FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
                <Search className="size-8 text-muted-foreground" />
                <p className="font-medium">No medicines match</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {filter !== "all" || query
                    ? "Try a different search term or clear the status filter to see everything in your cabinet."
                    : "Nothing to show."}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear search and filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ul className="mt-6 grid gap-4 lg:grid-cols-2">
              {visible.map(({ item, status, medicine }) => (
                <li key={item.id}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg">{item.brandName}</CardTitle>
                        {medicine && (
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {medicine.activeIngredients.join(", ")}
                          </p>
                        )}
                      </div>
                      <Badge className={cn("shrink-0", STATUS_META[status].badgeClass)}>
                        {STATUS_META[status].label}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {medicine && (
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <dt className="text-xs text-muted-foreground">Dosage</dt>
                            <dd className="font-medium">{medicine.dosage}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">Form</dt>
                            <dd className="font-medium">{medicine.form}</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-xs text-muted-foreground">Manufacturer</dt>
                            <dd className="font-medium">{medicine.manufacturer}</dd>
                          </div>
                        </dl>
                      )}
                      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`expiry-${item.id}`}
                            className="mb-1 block text-xs text-muted-foreground"
                          >
                            Expiry · {formatExpiry(item.expiry)}
                          </label>
                          <Input
                            id={`expiry-${item.id}`}
                            type="date"
                            value={item.expiry}
                            onChange={(e) => actions.updateExpiry(item.id, e.target.value)}
                            className="w-44"
                          />
                        </div>
                        <DeleteDialog item={item} />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Card className="mt-8 border-warning/40 bg-warning/10">
        <CardContent className="flex items-start gap-3 py-4 text-sm">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Educational information only.</span>{" "}
            MediLens AI is not a substitute for professional medical advice, diagnosis or treatment.
            Always confirm medicine details with the printed packaging and consult a qualified doctor
            or pharmacist before taking any medication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteDialog({ item }: { item: CabinetItem }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${item.brandName}`}
          className="self-end text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {item.brandName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this medicine from your cabinet. You can always scan and
            save it again later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => actions.removeFromCabinet(item.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
