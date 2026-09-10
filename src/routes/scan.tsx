import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ANALYSIS_STAGES, matchMedicine, validateImage } from "@/lib/analysis";
import { actions } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Medicine Scanner — MediLens AI" },
      {
        name: "description",
        content:
          "Scan or upload a photo of your medicine packaging and get a clear, plain-language breakdown in English or Telugu.",
      },
      { property: "og:title", content: "Medicine Scanner — MediLens AI" },
      {
        property: "og:description",
        content: "Upload a medicine photo and get an instant, easy-to-read medication profile.",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileSeed, setFileSeed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const running = stage >= 0;

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      setFileSeed(null);
      return;
    }
    setError(null);
    setFileSeed(`${file.name}-${file.size}`);
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (!running || !fileSeed) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;

    ANALYSIS_STAGES.forEach((s, index) => {
      acc += s.ms;
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          if (index < ANALYSIS_STAGES.length - 1) {
            setStage(index + 1);
          } else {
            const { medicine, confidence } = matchMedicine(fileSeed);
            const id = `scan-${Date.now().toString(36)}`;
            actions.addScan({
              id,
              medicineId: medicine.id,
              imageDataUrl: preview,
              confidence,
              scannedAt: new Date().toISOString(),
            });
            navigate({ to: "/analysis/$id", params: { id } });
          }
        }, acc),
      );
    });

    const tick = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [running, fileSeed, preview, navigate]);

  function start() {
    setElapsed(0);
    setStage(0);
  }

  function reset() {
    setPreview(null);
    setFileSeed(null);
    setError(null);
    setStage(-1);
    setElapsed(0);
  }

  const progress = running ? ((stage + 1) / ANALYSIS_STAGES.length) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Medicine scanner</h1>
      <p className="mt-2 text-muted-foreground">
        Upload a clear photo of the medicine pack. JPG, PNG or WebP up to 8 MB.
      </p>

      {!running && (
        <Card
          className={cn(
            "mt-6 border-2 border-dashed transition-colors",
            dragging && "border-primary bg-accent/40",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Selected medicine packaging"
                  className="max-h-64 rounded-xl border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Remove image"
                  className="absolute -right-3 -top-3 rounded-full bg-background p-1.5 shadow ring-1 ring-border"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <ImageUp className="size-7" />
                </span>
                <div>
                  <p className="font-medium">Drag and drop your medicine photo here</p>
                  <p className="text-sm text-muted-foreground">or choose an option below</p>
                </div>
              </>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                <Upload className="size-4" /> Browse files
              </Button>
              <Button variant="outline" onClick={() => cameraRef.current?.click()}>
                <Camera className="size-4" /> Take photo
              </Button>
              <Button disabled={!preview} onClick={start}>
                Analyse medicine
              </Button>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </CardContent>
        </Card>
      )}

      {running && (
        <Card className="mt-6">
          <CardContent className="space-y-5 py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="font-medium">Analysing your medicine…</p>
              <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                {elapsed.toFixed(1)}s
              </span>
            </div>
            <Progress value={progress} />
            <ul className="space-y-2">
              {ANALYSIS_STAGES.map((s, i) => (
                <li
                  key={s.key}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-colors",
                    i < stage && "text-muted-foreground line-through",
                    i === stage && "font-medium text-foreground",
                    i > stage && "text-muted-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      i <= stage ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  />
                  {s.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
