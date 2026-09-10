import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MedicineProfile } from "@/components/medicine-profile";
import { findMedicineById } from "@/data/medicines";
import { actions, useAppState } from "@/lib/store";

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

function AnalysisPage() {
  const { id } = useParams({ from: "/analysis/$id" });
  const { history, cabinet } = useAppState();
  const [saved, setSaved] = useState(false);

  const scan = history.find((h) => h.id === id);
  const medicine = scan ? findMedicineById(scan.medicineId) : undefined;

  if (!scan || !medicine) {
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

  const alreadySaved = saved || cabinet.some((c) => c.medicineId === medicine.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <MedicineProfile
        medicine={medicine}
        confidence={scan.confidence}
        imageDataUrl={scan.imageDataUrl}
      />

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
