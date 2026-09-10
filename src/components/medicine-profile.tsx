import { AlertTriangle, Info, Package, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Medicine } from "@/data/medicines";
import { actions, useAppState } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MedicineProfile({
  medicine,
  confidence,
  imageDataUrl,
}: {
  medicine: Medicine;
  confidence?: number;
  imageDataUrl?: string | null;
}) {
  const { language } = useAppState();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-start gap-5 py-6">
          {imageDataUrl && (
            <img
              src={imageDataUrl}
              alt={`Packaging photo of ${medicine.brandName}`}
              className="h-28 w-28 rounded-xl border border-border object-cover"
            />
          )}
          <div className="min-w-52 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{medicine.brandName}</h1>
            <p className="mt-1 text-muted-foreground">{medicine.activeIngredients.join(" + ")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{medicine.dosage}</Badge>
              <Badge variant="secondary">{medicine.form}</Badge>
              <Badge variant="outline">{medicine.manufacturer}</Badge>
            </div>
          </div>
          {typeof confidence === "number" && (
            <div className="rounded-xl bg-accent px-4 py-3 text-center text-accent-foreground">
              <p className="text-2xl font-semibold tabular-nums">{confidence}%</p>
              <p className="text-xs">Match confidence</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-primary" /> Plain-language summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-1 rounded-lg border border-border p-0.5 w-fit">
            {(
              [
                { code: "en", label: "English" },
                { code: "te", label: "తెలుగు" },
              ] as const
            ).map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => actions.setLanguage(code)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  language === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="leading-relaxed">{medicine.summary[language]}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Labelled uses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {medicine.uses.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4 text-primary" /> Packaging details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Batch: </span>
              {medicine.packaging.batch}
            </p>
            <p>
              <span className="text-muted-foreground">Expiry: </span>
              {medicine.packaging.expiry}
            </p>
            <p>
              <span className="text-muted-foreground">Storage: </span>
              {medicine.packaging.storage}
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" /> Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {medicine.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4 text-primary" /> Precautions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {medicine.precautions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
