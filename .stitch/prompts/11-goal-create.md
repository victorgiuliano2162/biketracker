A modular batch goal-creation workspace allowing cyclists to compose and validate multiple sport targets simultaneously in clean sequential draft cards.

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
1. **Sticky Global TopBar (64px height, Pure Surface #FFFFFF, 1px bottom border Hairline Zinc #E4E4E7):**
   - Left: Minimalist topographic contour / bike-route vector mark in Alpine Pine (#1B6B53) + bold Geist wordmark `"Tracker"`.
   - Center-left horizontal menu: `"Home"`, `"Mapas"` (with chevron indicator), `"Status"` (ACTIVE — highlighted in Alpine Pine #1B6B53 text with crisp 2px bottom underline and chevron dropdown indicator).
   - Right user area: Ghost button `"Perfil"` and secondary outline button `"Sair"`.
2. **Page Header (max-width 880px centered):** Back navigation link `"← Voltar para minhas metas"`; H1 `"Criar metas em lote"` (Geist 700); concise subtitle `"Configure um ou mais objetivos esportivos e salve todos simultaneamente."` in Graphite Secondary (#52525B).
3. **Sequential Draft Goal Cards Stack (max-width 880px centered, 24px vertical gap) — rendering `"Meta 1"` and `"Meta 2"`:**
   - Each draft card (Pure Surface #FFFFFF, 16px radius, 1px Hairline Zinc #E4E4E7 border, 24px padding) opens with a header strip displaying a Cloud Mist (#F4F4F5) JetBrains Mono counter pill (`"Meta 1"` / `"Meta 2"`) on the left and a right-aligned 44px ghost `"Remover"` button with trash icon.
   - Inside each card is a **2-column CSS Grid form** (20px gap, fixed labels strictly 8px above 44px-height inputs):
     - Full-width (`span 2`) `"Nome da meta"` text input with right-aligned JetBrains Mono counter (`Meta 1`: `"Volume Dezembro — Serra Geral"` `29 / 100`; `Meta 2`: `"Altimetria Acumulada Verão"` `26 / 100`).
     - Paired row: `"Valor alvo"` numeric input in JetBrains Mono (`600` on Meta 1, `8500` on Meta 2) + `"Unidade de medida"` select dropdown (`Quilômetros (km)` selected on Meta 1, `Metros de elevação (metros)` selected on Meta 2; supporting `km`, `rides`, `horas`, `metros`).
     - `"Prazo limite"` date picker input displaying `31/12/2026` (Meta 1) / `31/01/2027` (Meta 2) in JetBrains Mono with helper note `"A partir de hoje"` 6px below in Steel Muted (#71717A).
     - Full-width (`span 2`) `"Descrição do objetivo"` multiline textarea with realistic cycling training notes (`"Consolidar volume semanal de rodagem em estrada antes das provas de janeiro."` / `"Completar subidas longas semanais com cadência controlada em serra."`).
4. **Global Batch Action Footer Bar (max-width 880px centered, sticky/anchored card or clean bar with 1px top Hairline Zinc #E4E4E7):** Left secondary outline button `"+ Adicionar outra meta"` (44px height, Pure Surface #FFFFFF, 1px #E4E4E7 border); Right Alpine Pine (#1B6B53) primary submit button `"Salvar metas (2)"` (44px height).
