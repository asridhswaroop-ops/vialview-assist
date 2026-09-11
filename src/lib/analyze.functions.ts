import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { extractionSchema, matchCatalogue, type AnalysisResult } from "@/lib/medicine-analysis";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const inputSchema = z.object({
  imageDataUrl: z.string().min(32),
});

export type AnalyzeResponse =
  | ({ ok: true } & AnalysisResult)
  | { ok: false; kind: string; message: string };

export const analyzeMedicineImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalyzeResponse> => {
    const match = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/.exec(data.imageDataUrl);
    if (!match) {
      return { ok: false, kind: "invalid", message: "That file isn't a supported image." };
    }
    const [, mime, base64] = match as unknown as [string, string, string];
    if (!ALLOWED.includes(mime)) {
      return { ok: false, kind: "invalid", message: "Please upload a JPG, PNG or WebP image." };
    }
    if (Math.floor((base64.length * 3) / 4) > MAX_BYTES) {
      return { ok: false, kind: "invalid", message: "Image is larger than 8 MB." };
    }

    const { readMedicineImage, VisionError } = await import("@/lib/vision.server");

    try {
      const raw = await readMedicineImage(data.imageDataUrl);
      const parsed = extractionSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          ok: false,
          kind: "parse",
          message: "The analysis result was incomplete. Please try scanning again.",
        };
      }
      return { ok: true, ...matchCatalogue(parsed.data) };
    } catch (error) {
      if (error instanceof VisionError) {
        return { ok: false, kind: error.kind, message: error.message };
      }
      console.error("Medicine analysis failed", error instanceof Error ? error.message : "unknown");
      return {
        ok: false,
        kind: "network",
        message: "We couldn't reach the analysis service. Please check your connection and retry.",
      };
    }
  });
