import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { actions, expiryStatus, useAppState } from "@/lib/store";

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

const STATUS_LABEL = {
  valid: "Valid",
  expiring: "Expiring soon",
  expired: "Expired",
} as const;

function CabinetPage() {
  const { cabinet } = useAppState();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Medicine cabinet</h1>
      <p className="mt-2 text-muted-foreground">
        {cabinet.length} {cabinet.length === 1 ? "medicine" : "medicines"} saved.
      </p>

      {cabinet.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Package className="size-7" />
            </span>
            <p className="font-medium">Your cabinet is empty</p>
            <p className="text-sm text-muted-foreground">
              Scan a medicine and save it here to track its expiry date.
            </p>
            <Button asChild>
              <Link to="/scan">Scan a medicine</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {cabinet.map((item) => {
            const status = expiryStatus(item.expiry);
            return (
              <li key={item.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-3 py-4">
                    <div className="min-w-40 flex-1">
                      <p className="font-medium">{item.brandName}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        status === "expired"
                          ? "bg-destructive text-destructive-foreground"
                          : status === "expiring"
                            ? "bg-warning text-warning-foreground"
                            : "bg-success text-success-foreground"
                      }
                    >
                      {STATUS_LABEL[status]}
                    </Badge>
                    <Input
                      type="date"
                      aria-label={`Expiry date for ${item.brandName}`}
                      value={item.expiry}
                      onChange={(e) => actions.updateExpiry(item.id, e.target.value)}
                      className="w-40"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.brandName}`}
                      onClick={() => actions.removeFromCabinet(item.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
