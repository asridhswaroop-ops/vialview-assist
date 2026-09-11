import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, ImageUp, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ANALYSIS_STAGES, validateImage } from "@/lib/analysis";
import { analyzeMedicineImage } from "@/lib/analyze.functions";
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

const TOTAL_MS = ANALYSIS_STAGES.reduce((sum, s) => sum + s.ms, 0);
const TIMEOUT_MS = 60_000;

function ScanPage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeMedicineImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onerror = () => setError("That image could not be read. Please try another photo.");
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  // Stage animation only — the result comes from the real analysis call.
  useEffect(() => {
    if (!running) return;
    let acc = 0;
    const timers = ANALYSIS_STAGES.slice(0, -1).map((s, index) => {
      acc += s.ms;
      return setTimeout(() => setStage((current) => Math.max(current, index + 1)), acc);
    });
    const tick = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [running]);

  async function start() {
    if (!preview) return;
    setElapsed(0);
    setError(null);
    setStage(0);
    const startedAt = Date.now();

    let result: Awaited<ReturnType<typeof analyze>>;
    try {
      result = await Promise.race([
        analyze({ data: { imageDataUrl: preview } }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
        ),
      ]);
    } catch (err) {
      setStage(-1);
      setError(
        err instanceof Error && err.message === "timeout"
          ? "The analysis took too long. Please check your connection and try again."
          : "We couldn't analyse this image right now. Please try again.",
      );
      return;
    }

    if (!result.ok) {
      setStage(-1);
      setError(result.message);
      return;
    }

    const remaining = Math.max(0, TOTAL_MS - (Date.now() - startedAt));
    await new Promise((resolve) => setTimeout(resolve, remaining));
    setStage(ANALYSIS_STAGES.length - 1);

    const id = `scan-${Date.now().toString(36)}`;
    actions.addScan({
      id,
      medicineId: result.medicineId,
      extraction: result.extraction,
      imageDataUrl: preview,
      confidence: Math.round(result.extraction.confidence),
      scannedAt: new Date().toISOString(),
    });
    navigate({ to: "/analysis/$id", params: { id } });
  }

  function reset() {
    setPreview(null);
    setError(null);
    setStage(-1);
    setElapsed(0);
  }

  const progress = running ? ((stage + 1) / ANALYSIS_STAGES.length) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Medicine scanner</h1>
      <p className="mt-2 text-muted-foreground">
        Upload a clear photo of the medicine pack. JPG, PNG or WebP up to 8 MB. Details are read
        from your photo; medical information comes only from our verified medicine list.
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
              <Button disabled={!preview} onClick={() => void start()}>
                {error && preview ? "Try again" : "Analyse medicine"}
              </Button>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="size-4" /> {error}
              </p>
            )}

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
