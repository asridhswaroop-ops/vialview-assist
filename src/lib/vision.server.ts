/**
 * Server-only Gemini vision call.
 * Never imported by client code — the API key stays on the server.
 */

import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const MODEL = "gemini-2.0-flash";

/**
 * OCR-only system prompt.
 * The AI must extract ONLY what is visibly printed on the package.
 * No medical advice, no inference from memory.
 */
const PROMPT = `You are an OCR assistant for medicine packaging photographs.
Read ONLY what is visibly printed on the package, blister or box in the image.
Rules:
- Never guess, infer or recall a medicine from memory. If text is not legible, return null.
- Do not provide medical advice, uses, warnings, dosing guidance or diagnoses.
- activeIngredients lists only ingredient names printed on the pack; empty array if none readable.
- expiryDate: return exactly as printed (e.g. "11/2027") or null.
- confidence: 0-100, how sure you are the medicine is correctly identified from the image alone.
- uncertainFields: names of the fields you could not read reliably.
- imageQuality: "good", "poor" (blurry/partial) or "unreadable".
- isMedicinePackage: false if the photo is not medicine packaging.

Extract the printed details from this medicine package photo and respond with a JSON object matching this exact shape (no markdown, raw JSON only):
{
  "medicineName": string | null,
  "activeIngredients": string[],
  "strength": string | null,
  "dosageForm": string | null,
  "manufacturer": string | null,
  "batchNumber": string | null,
  "expiryDate": string | null,
  "confidence": number,
  "uncertainFields": string[],
  "imageQuality": "good" | "poor" | "unreadable",
  "isMedicinePackage": boolean
}`;

export type VisionFailure = {
  kind: "config" | "rate_limit" | "credits" | "upstream" | "parse";
  message: string;
};

export class VisionError extends Error {
  kind: VisionFailure["kind"];
  constructor(failure: VisionFailure) {
    super(failure.message);
    this.kind = failure.kind;
  }
}

export async function readMedicineImage(dataUrl: string): Promise<unknown> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new VisionError({
      kind: "config",
      message: "AI analysis is not configured on this server.",
    });
  }

  // Strip the data-URL header to get raw base64 + mime type
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new VisionError({
      kind: "parse",
      message: "The analysis result could not be understood.",
    });
  }
  const [, mimeType, base64Data] = match as unknown as [string, string, string];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // Keep safety settings permissive so medicine text isn't blocked
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        // Ask Gemini to return structured JSON directly
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { mimeType, data: base64Data } },
    ]);

    const text = result.response.text();

    if (!text.trim()) {
      throw new VisionError({
        kind: "parse",
        message: "The analysis service returned an empty result.",
      });
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new VisionError({
        kind: "parse",
        message: "The analysis result could not be understood.",
      });
    }
  } catch (error) {
    // Re-throw our own typed errors unchanged
    if (error instanceof VisionError) throw error;

    const msg =
      error instanceof Error ? error.message : String(error);

    if (
      msg.includes("429") ||
      /quota|rate.?limit/i.test(msg)
    ) {
      throw new VisionError({
        kind: "rate_limit",
        message: "Too many scans right now. Please try again in a moment.",
      });
    }
    if (msg.includes("401") || /api.?key|invalid.?key/i.test(msg)) {
      throw new VisionError({
        kind: "config",
        message:
          "The AI analysis key is invalid. Please check the server configuration.",
      });
    }
    if (msg.includes("403")) {
      throw new VisionError({
        kind: "credits",
        message: "AI analysis is temporarily unavailable for this workspace.",
      });
    }

    console.error("Vision error", msg.slice(0, 500));
    throw new VisionError({
      kind: "upstream",
      message: "The analysis service could not read the image.",
    });
  }
}
