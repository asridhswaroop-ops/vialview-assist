/**
 * Server-only Lovable AI Gateway vision call.
 * Never imported by client code — the API key stays on the server.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    medicineName: { type: ["string", "null"] },
    activeIngredients: { type: "array", items: { type: "string" } },
    strength: { type: ["string", "null"] },
    dosageForm: { type: ["string", "null"] },
    manufacturer: { type: ["string", "null"] },
    batchNumber: { type: ["string", "null"] },
    expiryDate: { type: ["string", "null"] },
    confidence: { type: "number" },
    uncertainFields: { type: "array", items: { type: "string" } },
    imageQuality: { type: "string", enum: ["good", "poor", "unreadable"] },
    isMedicinePackage: { type: "boolean" },
  },
  required: [
    "medicineName",
    "activeIngredients",
    "strength",
    "dosageForm",
    "manufacturer",
    "batchNumber",
    "expiryDate",
    "confidence",
    "uncertainFields",
    "imageQuality",
    "isMedicinePackage",
  ],
} as const;

const INSTRUCTIONS = `You are an OCR assistant for medicine packaging photographs.
Read ONLY what is visibly printed on the package, blister or box in the image.
Rules:
- Never guess, infer or recall a medicine from memory. If text is not legible, return null.
- Do not provide medical advice, uses, warnings, dosing guidance or diagnoses.
- activeIngredients lists only ingredient names printed on the pack; empty array if none readable.
- expiryDate: return exactly as printed (e.g. "11/2027") or null.
- confidence: 0-100, how sure you are the medicine is correctly identified from the image alone.
- uncertainFields: names of the fields you could not read reliably.
- imageQuality: "good", "poor" (blurry/partial) or "unreadable".
- isMedicinePackage: false if the photo is not medicine packaging.`;

export type VisionFailure = { kind: "config" | "rate_limit" | "credits" | "upstream" | "parse"; message: string };

export class VisionError extends Error {
  kind: VisionFailure["kind"];
  constructor(failure: VisionFailure) {
    super(failure.message);
    this.kind = failure.kind;
  }
}

export async function readMedicineImage(dataUrl: string): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new VisionError({ kind: "config", message: "AI analysis is not configured on this server." });
  }

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Extract the printed details from this medicine package photo." },
            { type: "input_image", image_url: dataUrl },
          ],
        },
      ],
      stream: true,
      reasoning: { effort: "low" },
      text: {
        format: { type: "json_schema", name: "medicine_reading", strict: true, schema: JSON_SCHEMA },
      },
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new VisionError({ kind: "rate_limit", message: "Too many scans right now. Please try again in a moment." });
    }
    if (response.status === 402 || response.status === 403) {
      throw new VisionError({
        kind: "credits",
        message: "AI analysis is temporarily unavailable for this workspace.",
      });
    }
    console.error("Vision gateway error", response.status, detail.slice(0, 500));
    throw new VisionError({ kind: "upstream", message: "The analysis service could not read the image." });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          if (!text) text = event.response.output_text;
        }
      } catch {
        /* ignore keepalive / partial frames */
      }
    }
  }

  if (!text.trim()) {
    throw new VisionError({ kind: "parse", message: "The analysis service returned an empty result." });
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new VisionError({ kind: "parse", message: "The analysis result could not be understood." });
  }
}
