A high-precision route-saving modal dialog floating over a dimmed GPX mapping studio, featuring immutable telemetry metrics, visibility governance, and AI-moderated trail photo uploads.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first (1440px viewport, 1400px max-width centered content with 48px side padding; edge-to-edge 100dvh for fullscreen map and split auth)
- Theme & Atmosphere: Light mode, bright minimalist alpine telemetry and Swiss cartographic precision — clean, technical, uncluttered, breathable industrial cycling aesthetic with generous whitespace and hairline structural borders
- Page Background (Canvas): Alabaster Zinc (#FAFAFA)
- Primary Surface (Cards, Tables, Inputs, Sticky TopBar, Modals): Pure Surface (#FFFFFF)
- Recessed Secondary Surface (Table headers, neutral badges, inactive progress tracks, subtle hovers): Cloud Mist (#F4F4F5)
- Floating Map HUD Surface (exclusive to /map overlays): Frosted HUD (rgba(255, 255, 255, 0.88) with backdrop-filter blur 12px)
- Text Primary (Headings, titles, KPI values): Obsidian Ink (#18181B) — NEVER pure black #000000
- Text Secondary (Body copy, descriptions, form labels): Graphite Secondary (#52525B)
- Text Muted (Units km/m, dates, placeholders, inactive icons): Steel Muted (#71717A)
- Borders & Dividers: Hairline Zinc (#E4E4E7, 1px solid)
- Elevation: Flat by default; Whisper Elevation shadow (0 12px 32px -12px rgba(24, 24, 27, 0.08)) reserved exclusively for floating HUDs, modals, and subtle card hover
- Single Brand Accent: Alpine Pine (#1B6B53) for primary CTAs, active nav indicators, input focus rings, goal progress fills, and elevation curve stroke; Deep Canopy (#145340) for hover/pressed; Alpine Tint (#EFF7F4) for selected states, Public visibility pills, and elevation area gradient fill
- Semantic Functional Colors: Emerald Goal Complete (#15803D on #ECFDF3) for 100% completed goals, verified NSFW photos, and EASY difficulty; Ochre Terrain (#B45309 on #FEF3C7) for approaching deadlines and MODERATE difficulty; Burnt Clay (#C2410C on #FFF7ED) for steep climb grades and HARD difficulty; Crimson Alert (#C93B3B on #FEF2F2) for errors, expired goals, destructive actions, and EXPERT difficulty; Slate Private (#475569 on #F1F5F9) for Private visibility pills
- Typography: Geist sans-serif for all headings (H1 700 36px tracking -0.025em, H2 600 24px, H3 600 17px), body copy (400 16px), and form labels (500 13px); JetBrains Mono with tabular numerals (font-variant-numeric: tabular-nums) MANDATORY on all distances (km), elevations (m), percentages, GPS counts, coordinates, dates (dd/MM/yyyy), chart axes, and ISO country codes (BR, PT)
- Shapes & Geometry: Smoothly rounded architectural cards and table containers (16px); generously rounded modals and floating HUD panels (20px); subtly rounded precision buttons, inputs, selects, and segmented toggles (10px, min-height 44px, 48px on auth primary actions); pill-shaped (9999px) visibility chips, difficulty tags, status badges, and 8px progress tracks; circular 44px floating map action buttons
- Forms: Fixed label always 8px ABOVE each input field (NO floating Material labels); helper or validation text 6px BELOW input
- UI Language: All visible interface text, navigation, labels, buttons, and cycling data strictly in Brazilian Portuguese (pt-BR)

**STRICT CONSTRAINTS (NEVER DO):**
- ZERO emojis anywhere in the interface (use crisp thin-stroke monochrome vector icons and monospaced ISO country codes like BR, PT — never emoji flags or icons)
- NO Inter font and NO serif fonts anywhere
- NO pure black (#000000), NO purple/blue neon gradients, NO glowing shadows, NO warm/cool gray mixing
- NO generic symmetric 3-equal-card rows (use 2-column grids, unified divider strips, or asymmetric Bento grids)
- NO raw text overlaid directly on maps or photographs without a Frosted HUD or dedicated solid container
- NO fabricated tech clichés (e.g. "99.98% UPTIME", "John Doe", "Next-Gen"); use realistic Brazilian cycling routes and athlete names

**Page Structure:**
1. **Dimmed Background Context:** The GPX mapping studio (`/map` with TopBar, topographic map, Alpine Pine route trace, and layers HUD) softly visible behind a translucent zinc scrim (`rgba(24, 24, 27, 0.32)` with subtle backdrop blur).
2. **Centered Modal Dialog Container (max-width 560px, Pure Surface #FFFFFF, 20px border radius, 1px Hairline Zinc #E4E4E7 border, Whisper Elevation shadow):**
   - **Fixed Modal Header (24px padding, 1px bottom Hairline Zinc #E4E4E7):** Top row with Section H2 `"Salvar rota na nuvem"` on the left and a 44px × 44px close `×` icon button on the right; immediately below inside the header sits a Cloud Mist (#F4F4F5, 10px radius, 12px 16px padding) immutable telemetry summary bar displaying `"DISTÂNCIA TOTAL"` -> **`48,4 km`** and `"GANHO DE ELEVAÇÃO"` -> **`+865 m`** side-by-side in bold JetBrains Mono.
   - **Scrollable Form Body (24px padding, fixed labels strictly 8px above 44px-height inputs):**
     - Field 1: `"Nome da rota"` required text input filled with `"Serra do Japi — Loop Norte"`, with right-aligned JetBrains Mono character counter `"26 / 80"` in Steel Muted (#71717A).
     - Paired 2-column CSS Grid row (16px gap): Left `"País"` select dropdown displaying a monospaced Cloud Mist ISO badge `"BR"` + `"Brasil"` (ZERO emoji flags); Right `"Visibilidade"` segmented control toggle (10px radius, 44px height) comparing `"Privada"` (lock icon, muted) against active `"Pública"` (globe icon, Alpine Tint #EFF7F4 fill, Alpine Pine #1B6B53 text and border).
     - Field 3 — `"Fotos da atividade"`: Drag-and-drop upload zone (1px dashed Hairline Zinc #E4E4E7 border, 10px radius, Cloud Mist subtle background, thin cloud-upload vector icon, `"Arraste fotos aqui ou clique para selecionar"` with `"JPG, PNG ou WEBP"` helper note), followed by a **4-column thumbnail preview grid** (10px radius) showing 3 cycling trail landscape thumbnails with top-right 24px circular remove `×` buttons and crisp inline AI moderation status pills placed cleanly below each thumbnail (never overlaid raw without container): two pills showing Emerald Goal Complete (`#15803D` on `#ECFDF3`, `"Aprovada"`) and the third showing a subtle 16px inline spinner (`"Validando IA..."` in Cloud Mist `#F4F4F5`).
   - **Fixed Modal Footer (1px top Hairline Zinc #E4E4E7, 16px 24px padding):** Right-aligned 12px gap button pair: secondary outline button `"Cancelar"` (44px height, 1px #E4E4E7 border) and Alpine Pine (#1B6B53) primary submit button `"Salvar rota"` (44px height).
