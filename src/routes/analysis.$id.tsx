import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, BookmarkCheck, BookmarkPlus, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedicineProfile } from "@/components/medicine-profile";
import { findMedicineById } from "@/data/medicines";
import { actions, useAppState, type ScanRecord } from "@/lib/store";

export const Route = createFileRoute("/analysis/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Result — MediLens AI" },
      {
        name: "description",
        content:
          "Full medication profile with dosage, uses, warnings, precautions and a plain-language summary.",
      },
      { property: "og:title", content: "Analysis Result — MediLens AI" },
      {
        property: "og:description",
        content: "Your scanned medicine explained in simple English or Telugu.",
      },
    ],
  }),
  component: AnalysisPage,
});

function ReadingCard({ scan }: { scan: ScanRecord }) {
  const e = scan.extraction;
  if (!e) return null;
  const rows: [string, string | null][] = [
    ["Name on pack", e.medicineName],
    ["Ingredients read", e.activeIngredients.length ? e.activeIngredients.join(", ") : null],
    ["Strength", e.strength],
    ["Form", e.dosageForm],
    ["Manufacturer", e.manufacturer],
    ["Batch number", e.batchNumber],
    ["Expiry on pack", e.expiryDate],
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScanLine className="size-4 text-primary" /> Read from your photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {rows.map(([label, value]) => (
          <p key={label}>
            <span className="text-muted-foreground">{label}: </span>
            {value ?? <span className="text-muted-foreground italic">not readable</span>}
          </p>
        ))}
        {e.uncertainFields.length > 0 && (
          <p className="pt-2 text-xs text-muted-foreground">
            Less certain about: {e.uncertainFields.join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AnalysisPage() {
  const { id } = useParams({ from: "/analysis/$id" });
  const { history, cabinet } = useAppState();
  const [saved, setSaved] = useState(false);

  const scan = history.find((h) => h.id === id);
  const medicine = findMedicineById(scan?.medicineId);

  if (!scan) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="font-medium">This scan result isn't available</p>
            <p className="text-sm text-muted-foreground">
              Scan results are stored on this device only. Try scanning the medicine again.
            </p>
            <Button asChild>
              <Link to="/scan">Go to scanner</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!medicine) {
    const poorImage = scan.extraction?.imageQuality !== "good";
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
        <Card className="border-warning/50">
          <CardContent className="flex flex-wrap items-start gap-5 py-6">
            {scan.imageDataUrl && (
              <img
                src={scan.imageDataUrl}
                alt="Scanned medicine packaging"
                className="h-28 w-28 rounded-xl border border-border object-cover"
              />
            )}
            <div className="min-w-52 flex-1">
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                <AlertTriangle className="size-5 text-destructive" />
                Medicine not confirmed
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {scan.extraction?.isMedicinePackage === false
                  ? "This photo doesn't look like medicine packaging. Please take a photo of the pack, box or blister."
                  : poorImage
                    ? "The photo was blurry or only partly visible, so we can't confirm the medicine. Please retake it in good light with the label flat and in focus."
                    : "We read the pack, but this medicine isn't in our verified medicine list, so we can't show trusted uses, warnings or precautions."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">Reading confidence {Math.round(scan.confidence)}%</Badge>
                <Badge variant="secondary">Not verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <ReadingCard scan={scan} />

        <Card>
          <CardContent className="py-5 text-sm text-muted-foreground">
            We only show uses, warnings, precautions and storage advice from our verified medicine
            list. Nothing above is medical advice — please check with your pharmacist or doctor.
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/scan">Retake photo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/search">Search by name instead</Link>
          </Button>
        </div>
      </div>
    );
  }

  const alreadySaved = saved || cabinet.some((c) => c.medicineId === medicine.id);
  const lowConfidence = scan.confidence < 70;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {lowConfidence && (
        <Card className="mb-6 border-destructive/40">
          <CardContent className="flex items-start gap-3 py-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>
              The photo was hard to read, so this match may not be correct. Please confirm the name
              on your pack, or retake the photo in better light.
            </p>
          </CardContent>
        </Card>
      )}

      <MedicineProfile
        medicine={medicine}
        confidence={scan.confidence}
        imageDataUrl={scan.imageDataUrl}
      />

      <div className="mt-6">
        <ReadingCard scan={scan} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          disabled={alreadySaved}
          onClick={() => {
            actions.saveToCabinet({
              id: `cab-${Date.now().toString(36)}`,
              medicineId: medicine.id,
              brandName: medicine.brandName,
              expiry: medicine.packaging.expiry,
              addedAt: new Date().toISOString(),
            });
            setSaved(true);
          }}
        >
          {alreadySaved ? <BookmarkCheck className="size-4" /> : <BookmarkPlus className="size-4" />}
          {alreadySaved ? "Saved to cabinet" : "Save to cabinet"}
        </Button>
        <Button variant="outline" asChild>
          <Link to="/cabinet">View cabinet</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/scan">Scan another</Link>
        </Button>
      </div>
    </div>
  );
}
