import { createFileRoute, Link } from "@tanstack/react-router";
import { Languages, Package, ScanLine, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediLens AI — Understand Any Medicine Instantly" },
      {
        name: "description",
        content:
          "Scan a medicine pack and get dosage, uses, warnings and a plain-language summary in English or Telugu, plus expiry tracking.",
      },
      { property: "og:title", content: "MediLens AI — Understand Any Medicine Instantly" },
      {
        property: "og:description",
        content: "Scan, understand and track your medicines in English or Telugu.",
      },
    ],
  }),
  component: Home,
});

const FEATURES = [
  {
    icon: ScanLine,
    title: "Scan any pack",
    body: "Upload or photograph the packaging and get an instant medication profile.",
  },
  {
    icon: Languages,
    title: "English & Telugu",
    body: "Every summary is written in plain language and switches between both languages.",
  },
  {
    icon: Package,
    title: "Expiry tracking",
    body: "Save medicines to your cabinet and see what is valid, expiring or expired.",
  },
  {
    icon: Search,
    title: "Instant search",
    body: "Look up medicines by brand name, active ingredient or manufacturer.",
  },
];

function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="py-16 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <ShieldCheck className="size-3.5" /> Informational use only
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Understand any medicine in seconds
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          MediLens AI reads your medicine packaging and explains the dosage, uses, warnings and
          precautions in simple English or Telugu.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/scan">
              <ScanLine className="size-4" /> Scan a medicine
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/search">Browse medicines</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="py-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-medium">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
