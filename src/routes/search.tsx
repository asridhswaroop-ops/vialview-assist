import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchMedicines } from "@/data/medicines";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Medicine Search — MediLens AI" },
      {
        name: "description",
        content: "Search medicines by brand name, active ingredient or manufacturer.",
      },
      { property: "og:title", content: "Medicine Search — MediLens AI" },
      {
        property: "og:description",
        content: "Instant lookup across brand names, ingredients and manufacturers.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMedicines(query), [query]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Search medicines</h1>
      <p className="mt-2 text-muted-foreground">
        Search by brand name, active ingredient or manufacturer.
      </p>

      <div className="relative mt-6">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. paracetamol, Sun Pharma, Cetzine"
          className="pl-9"
          aria-label="Search medicines"
        />
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      <ul className="mt-3 space-y-3">
        {results.map((m) => (
          <li key={m.id}>
            <Link to="/medicine/$id" params={{ id: m.id }} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="py-4">
                  <p className="font-medium">{m.brandName}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.activeIngredients.join(", ")} · {m.dosage} · {m.form}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.manufacturer}</p>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No medicines matched “{query}”. Try a different name or ingredient.
        </p>
      )}
    </div>
  );
}
