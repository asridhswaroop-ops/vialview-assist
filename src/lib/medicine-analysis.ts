import { z } from "zod";
import { MEDICINES, type Medicine } from "@/data/medicines";

/** Strict schema for what the vision model is allowed to return. */
export const extractionSchema = z.object({
  medicineName: z.string().nullable(),
  activeIngredients: z.array(z.string()),
  strength: z.string().nullable(),
  dosageForm: z.string().nullable(),
  manufacturer: z.string().nullable(),
  batchNumber: z.string().nullable(),
  expiryDate: z.string().nullable(),
  confidence: z.number().min(0).max(100),
  uncertainFields: z.array(z.string()),
  imageQuality: z.enum(["good", "poor", "unreadable"]),
  isMedicinePackage: z.boolean(),
});

export type Extraction = z.infer<typeof extractionSchema>;

export type AnalysisResult = {
  extraction: Extraction;
  /** Catalogue entry id when the reading matches a verified medicine, else null. */
  medicineId: string | null;
  /** How strongly the extraction matched the catalogue (0-100). */
  matchScore: number;
};

/** Below this the identification is treated as uncertain and never confirmed. */
export const MIN_CONFIDENCE = 55;

function norm(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value: string) {
  return norm(value).split(" ").filter((t) => t.length > 2);
}

function scoreAgainst(medicine: Medicine, extraction: Extraction): number {
  const brand = norm(medicine.brandName);
  const name = norm(extraction.medicineName);
  let score = 0;

  if (name && brand) {
    if (name === brand) score += 60;
    else if (brand.includes(name) || name.includes(brand)) score += 45;
    else {
      const brandTokens = tokens(medicine.brandName);
      const nameTokens = tokens(extraction.medicineName ?? "");
      if (brandTokens.some((b) => nameTokens.includes(b))) score += 30;
    }
  }

  const catalogueIngredients = medicine.activeIngredients.flatMap((i) => tokens(i));
  const readIngredients = extraction.activeIngredients.flatMap((i) => tokens(i));
  if (catalogueIngredients.some((c) => readIngredients.includes(c))) score += 30;

  if (extraction.strength && norm(extraction.strength) === norm(medicine.dosage)) score += 10;
  if (
    extraction.manufacturer &&
    tokens(medicine.manufacturer).some((m) => tokens(extraction.manufacturer ?? "").includes(m))
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

/** Match a reading to the trusted catalogue. Never invents an entry. */
export function matchCatalogue(extraction: Extraction): AnalysisResult {
  let best: { id: string; score: number } | null = null;
  for (const medicine of MEDICINES) {
    const score = scoreAgainst(medicine, extraction);
    if (!best || score > best.score) best = { id: medicine.id, score };
  }

  const confident =
    extraction.isMedicinePackage &&
    extraction.confidence >= MIN_CONFIDENCE &&
    !!best &&
    best.score >= 45;

  return {
    extraction,
    medicineId: confident && best ? best.id : null,
    matchScore: best?.score ?? 0,
  };
}

export function isUncertain(result: AnalysisResult) {
  return (
    !result.extraction.isMedicinePackage ||
    result.extraction.imageQuality === "unreadable" ||
    result.extraction.confidence < MIN_CONFIDENCE
  );
}
