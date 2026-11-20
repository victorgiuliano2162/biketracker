An analytical cycling route inspection page combining an executive header, unified telemetry bar, wide interactive route map, synchronized full-width elevation chart, and trail photo gallery.

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
   - Center-left horizontal menu: `"Home"`, `"Mapas"` (ACTIVE — highlighted in Alpine Pine #1B6B53 text with crisp 2px bottom underline and chevron dropdown indicator), `"Status"` (with chevron indicator).
   - Right user area: Ghost button `"Perfil"` and secondary outline button `"Sair"`.
2. **Executive Route Header (max-width 1400px centered, 48px horizontal padding):** Top back navigation link `"← Voltar para rotas"`; Left block displaying H1 `"Serra do Japi — Loop Norte"` (Geist 700), metadata line `"Marina Costa · Jundiaí, BR · 14/11/2026 às 06:42"` (JetBrains Mono for date, time, and ISO `BR`), and pill-shaped `HARD` difficulty badge (Burnt Clay #C2410C on #FFF7ED); Right action group featuring interactive `"Pública"` capsule pill (globe icon, #1B6B53 on #EFF7F4), Alpine Pine (#1B6B53) primary CTA `"Baixar GPX"` (44px height, download icon), and secondary 44px `"..."` context button.
3. **Unified 3-Metric Analytical Telemetry Strip (single Pure Surface #FFFFFF architectural container bar, 16px radius, 1px Hairline Zinc #E4E4E7 border, internally separated by 1px vertical Hairline Zinc dividers — NOT 3 separate cards):**
   - Column 1: Micro-label `"DISTÂNCIA PERCORRIDA"` + **`48,4 km`** in bold JetBrains Mono 32px (`#18181B`) + mono sub-caption `"1.842 pontos GPX"`.
   - Column 2: Micro-label `"ELEVAÇÃO ACUMULADA"` + **`+865 m`** in bold JetBrains Mono 32px (`#18181B`) + mono sub-caption `"Descida -862 m"`.
   - Column 3: Micro-label `"ELEVAÇÃO MÉDIA"` + **`942 m`** in bold JetBrains Mono 32px (`#18181B`) + mono sub-caption `"Mín 718 m · Máx 1.214 m"`.
4. **Wide Interactive Route Map (`aspect-ratio: 16/7`, 16px radius, 1px Hairline Zinc #E4E4E7 border, Pure Surface #FFFFFF frame):** Crisp light Swiss topographic map showing the full Alpine Pine (#1B6B53, 3.5px stroke) GPX cycling loop, clean `A` (Início) and `B` (Fim) circular markers, zoom controls in the corner, and a bright active circular telemetry position marker positioned on the main climb synchronized with the elevation chart below.
5. **Full-Width Synchronized Elevation Chart Card (Pure Surface #FFFFFF, 16px radius, 1px Hairline Zinc #E4E4E7 border, 24px padding):** Header row with Section H2 `"Perfil altimétrico"` on left and subtle gradient legend (`"Subida acentuada"` in Burnt Clay #C2410C) on right; wide Chart.js-style elevation curve with 2px Alpine Pine (#1B6B53) stroke, soft Alpine Tint (#EFF7F4) area gradient fill, steep climb segment accented in Burnt Clay (#C2410C), JetBrains Mono distance/altitude axes, vertical crosshair guide line at `24,6 km`, and floating monospaced tooltip card (`"24,6 km · 1.186 m · +7,4% · 08:14"`).
6. **Trail Photo Gallery Section:** Section H2 `"Fotos da atividade"` paired with JetBrains Mono badge `"4 fotos"`; clean 4-column responsive photo grid (16px gap, 12px radius, 1px #E4E4E7 border) displaying 4 crisp cycling and mountain trail photographs with ZERO text overlaid directly on the images (only a clean solid circular 36px zoom/lightbox button tucked neatly in the corner).
