import { MEDICINES, type Medicine } from "@/data/medicines";

export const ANALYSIS_STAGES = [
  { key: "prepare", label: "Preparing image", ms: 700 },
  { key: "read", label: "Reading packaging", ms: 1100 },
  { key: "identify", label: "Identifying medicine", ms: 1000 },
  { key: "extract", label: "Extracting information", ms: 900 },
  { key: "results", label: "Preparing results", ms: 600 },
] as const;

/** Deterministic pseudo-match: same file always resolves to the same medicine. */
export function matchMedicine(seed: string): { medicine: Medicine; confidence: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const medicine = MEDICINES[hash % MEDICINES.length]!;
  const confidence = 82 + (hash % 16); // 82–97
  return { medicine, confidence };
}

export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Please upload a JPG, PNG or WebP image.";
  if (file.size > MAX_FILE_BYTES) return "Image is larger than 8 MB. Please use a smaller photo.";
  return null;
}
