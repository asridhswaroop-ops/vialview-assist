export type Medicine = {
  id: string;
  brandName: string;
  activeIngredients: string[];
  dosage: string;
  form: string;
  manufacturer: string;
  uses: string[];
  warnings: string[];
  precautions: string[];
  packaging: {
    batch: string;
    expiry: string;
    storage: string;
  };
  summary: {
    en: string;
    te: string;
  };
};

export const MEDICINES: Medicine[] = [
  {
    id: "paracetamol-500",
    brandName: "Dolo 650",
    activeIngredients: ["Paracetamol (Acetaminophen)"],
    dosage: "650 mg",
    form: "Film-coated tablet",
    manufacturer: "Micro Labs Ltd.",
    uses: ["Fever", "Mild to moderate pain", "Headache", "Body ache"],
    warnings: [
      "Do not exceed 4 g of paracetamol in 24 hours.",
      "Avoid alcohol — risk of liver damage.",
    ],
    precautions: [
      "Use with caution in liver or kidney disease.",
      "Check other medicines for paracetamol to avoid double dosing.",
    ],
    packaging: { batch: "MLD-2291", expiry: "2027-04-30", storage: "Store below 30°C, away from light" },
    summary: {
      en: "This is a common fever and pain reliever. Take one tablet with water after food, up to three times a day, and never more than four in a day.",
      te: "ఇది సాధారణ జ్వరం మరియు నొప్పి నివారణ మందు. భోజనం తర్వాత నీటితో ఒక మాత్ర, రోజుకు మూడు సార్ల వరకు తీసుకోవచ్చు; రోజుకు నాలుగు మాత్రలకు మించకూడదు.",
    },
  },
  {
    id: "amoxicillin-500",
    brandName: "Mox 500",
    activeIngredients: ["Amoxicillin Trihydrate"],
    dosage: "500 mg",
    form: "Capsule",
    manufacturer: "Sun Pharmaceutical Industries Ltd.",
    uses: ["Bacterial throat infection", "Ear infection", "Chest infection", "Urinary tract infection"],
    warnings: [
      "Not effective against viral infections such as the common cold.",
      "Stop and seek help if rash, swelling or breathing difficulty occurs.",
    ],
    precautions: [
      "Complete the full course even if you feel better.",
      "Tell your doctor about any penicillin allergy.",
    ],
    packaging: { batch: "SUN-8814", expiry: "2026-11-30", storage: "Store in a dry place below 25°C" },
    summary: {
      en: "This is an antibiotic used for bacterial infections. Take it at evenly spaced times and finish the whole course your doctor prescribed.",
      te: "ఇది బ్యాక్టీరియా ఇన్ఫెక్షన్లకు వాడే యాంటీబయాటిక్. సమాన వ్యవధిలో తీసుకోండి మరియు డాక్టర్ చెప్పిన కోర్సు పూర్తిగా ముగించండి.",
    },
  },
  {
    id: "cetirizine-10",
    brandName: "Cetzine 10",
    activeIngredients: ["Cetirizine Hydrochloride"],
    dosage: "10 mg",
    form: "Tablet",
    manufacturer: "Dr. Reddy's Laboratories Ltd.",
    uses: ["Allergy", "Runny nose", "Sneezing", "Itching and hives"],
    warnings: ["May cause drowsiness — avoid driving until you know how it affects you."],
    precautions: ["Avoid alcohol.", "Reduce dose in kidney problems as advised by a doctor."],
    packaging: { batch: "DRL-4402", expiry: "2026-08-31", storage: "Store below 30°C in original pack" },
    summary: {
      en: "This is an anti-allergy tablet. One tablet at night usually controls sneezing, itching and a runny nose.",
      te: "ఇది అలర్జీ నివారణ మాత్ర. సాధారణంగా రాత్రి ఒక మాత్ర తీసుకుంటే తుమ్ములు, దురద మరియు ముక్కు కారడం తగ్గుతుంది.",
    },
  },
  {
    id: "metformin-500",
    brandName: "Glycomet 500",
    activeIngredients: ["Metformin Hydrochloride"],
    dosage: "500 mg",
    form: "Extended-release tablet",
    manufacturer: "USV Private Ltd.",
    uses: ["Type 2 diabetes", "Blood sugar control"],
    warnings: [
      "Stop and contact a doctor if you have severe vomiting, dehydration or breathing difficulty.",
      "Not for use in severe kidney disease.",
    ],
    precautions: ["Take with food to reduce stomach upset.", "Monitor blood sugar regularly."],
    packaging: { batch: "USV-1177", expiry: "2027-01-31", storage: "Store below 30°C, keep dry" },
    summary: {
      en: "This medicine lowers blood sugar in type 2 diabetes. Take it with meals and do not skip doses without asking your doctor.",
      te: "ఈ మందు టైప్ 2 మధుమేహంలో రక్తంలో చక్కెరను తగ్గిస్తుంది. భోజనంతో తీసుకోండి, డాక్టర్‌ను అడగకుండా డోసు మానవద్దు.",
    },
  },
  {
    id: "pantoprazole-40",
    brandName: "Pan 40",
    activeIngredients: ["Pantoprazole Sodium"],
    dosage: "40 mg",
    form: "Enteric-coated tablet",
    manufacturer: "Alkem Laboratories Ltd.",
    uses: ["Acidity", "Acid reflux (GERD)", "Stomach ulcer"],
    warnings: ["Long-term use may affect vitamin B12 and magnesium levels."],
    precautions: ["Take 30–60 minutes before breakfast.", "Swallow whole; do not crush."],
    packaging: { batch: "ALK-6620", expiry: "2026-06-30", storage: "Store below 25°C" },
    summary: {
      en: "This tablet reduces stomach acid. Take it in the morning before food for heartburn and acidity relief.",
      te: "ఈ మాత్ర కడుపులో ఆమ్లాన్ని తగ్గిస్తుంది. గుండెల్లో మంట, ఎసిడిటీ కోసం ఉదయం భోజనానికి ముందు తీసుకోండి.",
    },
  },
  {
    id: "azithromycin-500",
    brandName: "Azithral 500",
    activeIngredients: ["Azithromycin Dihydrate"],
    dosage: "500 mg",
    form: "Tablet",
    manufacturer: "Alembic Pharmaceuticals Ltd.",
    uses: ["Respiratory infection", "Skin infection", "Throat infection"],
    warnings: ["Do not use without a prescription.", "May affect heart rhythm in sensitive people."],
    precautions: ["Usually taken once daily for 3–5 days.", "Take one hour before or two hours after food."],
    packaging: { batch: "ALM-3098", expiry: "2027-09-30", storage: "Store below 30°C, protect from moisture" },
    summary: {
      en: "This is a short-course antibiotic, usually one tablet a day for three to five days as prescribed.",
      te: "ఇది స్వల్పకాలిక యాంటీబయాటిక్; సాధారణంగా డాక్టర్ సూచన మేరకు మూడు నుంచి ఐదు రోజులు రోజుకు ఒక మాత్ర.",
    },
  },
];

export function findMedicineById(id: string) {
  return MEDICINES.find((m) => m.id === id);
}

export function searchMedicines(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return MEDICINES;
  return MEDICINES.filter((m) =>
    [m.brandName, m.manufacturer, ...m.activeIngredients].some((f) => f.toLowerCase().includes(q)),
  );
}
