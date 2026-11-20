A structured personal cycling route management console emphasizing 1-click privacy governance, scannable tabular telemetry, and clear administrative controls.

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
2. **Page Header (max-width 1400px centered, 48px horizontal padding):** Left H1 `"Minhas rotas"` (Geist 700) paired inline with a Cloud Mist (#F4F4F5) JetBrains Mono counter pill `"18 rotas salvas"` in Graphite Secondary (#52525B); Right Alpine Pine (#1B6B53) primary CTA button `"+ Importar GPX"` (44px height, upload icon).
3. **Structured Personal Routes List (single architectural Pure Surface #FFFFFF container, 16px radius, 1px Hairline Zinc #E4E4E7 border, rows separated by 1px horizontal Hairline Zinc dividers):**
   - Subtle Cloud Mist (#F4F4F5) header strip labeling `"Percurso"`, `"Telemetria"`, and `"Privacidade e Ações"`.
   - Display 6 realistic cycling route rows in a clean 3-zone horizontal grid (`45% | 28% | 27%`):
     - *Zone 1 (Left, 45%):* Clickable route title (Card H3 Geist 600, Obsidian Ink #18181B) + metadata subtitle showing formatted date (`dd/MM/yyyy` in JetBrains Mono) and location with ISO code (`Jundiaí, BR` — NO emoji flags).
     - *Zone 2 (Center, 28%):* Side-by-side tabular JetBrains Mono metrics for Distance (`48,4 km`) and Elevation Gain (`+865 m`) with muted Steel Muted (#71717A) micro-labels.
     - *Zone 3 (Right, 27%):* Interactive 1-click capsule pill toggle (`9999px` radius, 32px height inside 44px hit target) switching between **Pública** (globe vector icon, Alpine Pine #1B6B53 text on Alpine Tint #EFF7F4 pill) and **Privada** (lock vector icon, Slate Private #475569 text on #F1F5F9 pill), plus a 44px × 44px contextual `"..."` menu button.
   - Populate 6 rows (mix of 4 Públicas and 2 Privadas):
     1) `"Serra do Japi — Loop Norte"` · `14/11/2026` · `Jundiaí, BR` · `48,4 km` · `+865 m` · `Pública`
     2) `"Treino Intervalado Anel Viário"` · `11/11/2026` · `Campinas, BR` · `36,2 km` · `+310 m` · `Privada` (with open contextual popover menu on `"..."`: 10px radius, Pure Surface #FFFFFF, 1px #E4E4E7 border, Whisper Elevation shadow, showing `"Ver detalhes"` with eye icon and destructive `"Excluir rota"` in Crimson Alert #C93B3B with trash icon)
     3) `"Estrada dos Romeiros — Pirapora"` · `08/11/2026` · `Cabreúva, BR` · `72,6 km` · `+1.140 m` · `Pública`
     4) `"Reconhecimento Serra da Cantareira"` · `04/11/2026` · `Mairiporã, BR` · `29,5 km` · `+740 m` · `Privada`
     5) `"Circuito das Frutas — Morungaba"` · `01/11/2026` · `Morungaba, BR` · `64,5 km` · `+1.280 m` · `Pública`
     6) `"Trilha da Pedra Grande — Atibaia"` · `27/10/2026` · `Atibaia, BR` · `41,0 km` · `+920 m` · `Pública`
4. **Pagination & Page-Size Footer:** Left page-size selector `"Itens por página:"` with `5`, `10` (active in Alpine Tint #EFF7F4 / Alpine Pine #1B6B53), and `20` segmented buttons; Right pagination showing `"1–6 de 18"` in JetBrains Mono with `"Anterior"`, `1` active, `2`, `3`, `"Próxima"` 44px controls.
