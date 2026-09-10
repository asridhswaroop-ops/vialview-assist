import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MedicineProfile } from "@/components/medicine-profile";
import { findMedicineById } from "@/data/medicines";

export const Route = createFileRoute("/medicine/$id")({
  head: () => ({
    meta: [
      { title: "Medicine Details — MediLens AI" },
      {
        name: "description",
        content: "Dosage, uses, warnings, precautions and packaging details for this medicine.",
      },
      { property: "og:title", content: "Medicine Details — MediLens AI" },
      {
        property: "og:description",
        content: "A clear breakdown of this medicine in English or Telugu.",
      },
    ],
  }),
  component: MedicineDetailPage,
});

function MedicineDetailPage() {
  const { id } = useParams({ from: "/medicine/$id" });
  const medicine = findMedicineById(id);

  if (!medicine) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="font-medium">Medicine not found</p>
            <Button asChild>
              <Link to="/search">Back to search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <MedicineProfile medicine={medicine} />
    </div>
  );
}
