# MediLens Health Navigator

Build MediLens AI replicating the exact features, UI, and architecture from asridhswaroop-ops/medilens-insight-navigator:
1. Navigation & Layout: Header with logo, navigation links (Scanner, Cabinet, Search), language switcher (English/Telugu), and auth action; safety disclaimer footer.
2. Medicine Scanner (/scan): Image upload & camera capture dropzone supporting drag-and-drop, file browsing, and mobile camera capture. Validates JPG, PNG, WebP up to 8 MB. Multi-stage processing panel showing progressive analysis stages (Preparing image, Reading packaging, Identifying medicine, Extracting info, Preparing results) with progress bar and timing before transitioning to results.
3. Analysis & Results (/analysis/:id): Full medication profile displaying brand name, active ingredients, dosage, form, manufacturer, confidence score, labeled uses, warnings, precautions, and packaging details (batch, expiry, storage). Includes plain-language summary toggleable between English and Telugu, and a "Save to Cabinet" button.
4. Medicine Cabinet (/cabinet): List of saved medicines with color-coded expiry status badges (valid, expiring soon, expired), inline expiry editing, and deletion.
5. Medicine Search (/search): Instant search by medicine name, active ingredients, and manufacturer with quick-access detail links.
6. Mock Medicine Database & Analysis Engine: Typed medicines catalog (Paracetamol, Amoxicillin, Cetirizine, Metformin, etc.) with bilingual summaries (EN/TE) and deterministic matching logic.
7. Reactive State & Persistence: LocalStorage-backed reactive store for saved cabinet items, scan history, user session, and language preference.
8. Design System: Medical teal accent palette, clean typography, badge indicators, cards, and smooth micro-interactions.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a970b87-4179-4b69-815b-c14296de1300).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

### Real vision configuration

The scanner uses the existing server-only Lovable AI Gateway integration in `src/lib/vision.server.ts`. Copy `.env.example` to `.env.local` and set the required `LOVABLE_API_KEY` there:

```sh
LOVABLE_API_KEY=your-server-side-lovable-key
```

For deployment, configure `LOVABLE_API_KEY` as a server/runtime secret in the hosting provider. Do not use a `VITE_` variable, put the key in React code, or commit the real value. Without this variable, the scanner returns “AI analysis is not configured on this server.”

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
