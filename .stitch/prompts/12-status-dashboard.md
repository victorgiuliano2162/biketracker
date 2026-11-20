An asymmetric Bento-grid cycling performance analytics dashboard showcasing accumulated career telemetry, active goal progress, 7-day distance evolution, and recent ride logs.

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
2. **Page Header (max-width 1400px centered, 48px horizontal padding):** Left H1 `"Estatísticas & Performance"` (Geist 700); Right JetBrains Mono muted update label `"Atualizado em 19/11/2026"`.
3. **Bento Band 1 (Asymmetric CSS Grid `grid-template-columns: 7fr 5fr`, 24px gap — NEVER 3 equal cards):**
   - *Left (`7fr`) — Adaptive Engagement Banner Card (Pure Surface #FFFFFF, 16px radius, 1px Hairline Zinc #E4E4E7 border, 28px padding, subtle 4px Alpine Pine #1B6B53 left accent bar and faint topographic contour lines on right edge):* H2 `"Ritmo constante, Marina"`, adaptive volume summary `"Você já completou 42 pedaladas registradas no Tracker. Seu ganho de elevação subiu 14% neste mês."`, and two action buttons (`"Importar GPX"` in Alpine Pine #1B6B53 + `"Gerenciar metas"` secondary outline).
   - *Right (`5fr`) — Paired Career KPI Cards (`grid-template-columns: 1fr 1fr`, 16px gap):* Two clean architectural Pure Surface #FFFFFF cards (16px radius, 1px Hairline Zinc #E4E4E7 border, 24px padding):
     - KPI 1: Label `"DISTÂNCIA TOTAL"` + route vector icon -> **`2.486,4 km`** in JetBrains Mono 32px bold (`#18181B`) + mono sub-caption `"42 atividades"`.
     - KPI 2: Label `"ELEVAÇÃO TOTAL"` + mountain vector icon -> **`38.420 m`** in JetBrains Mono 32px bold (`#18181B`) + mono sub-caption `"Média 914 m/pedal"`.
4. **Bento Band 2 (Asymmetric CSS Grid `grid-template-columns: 7fr 5fr`, 24px gap):**
   - *Left (`7fr`) — Vertical Stack (24px gap):*
     - **Active Goals Card (Pure Surface #FFFFFF, 16px radius, 1px #E4E4E7, 24px padding):** Section H2 `"Metas em andamento"` + right `"Ver todas →"` link; top 3 active goals ordered closest to completion (`81%`, `71%`, `68%`), each with goal name, 8px pill-shaped Alpine Pine (#1B6B53) progress bar over Cloud Mist (#F4F4F5) track, and JetBrains Mono ratio (`"Desafio de Altimetria Alpina" — 4.850 / 6.000 m · 81%`, `"Base Aeróbica em Selim" — 28,5 / 40 h · 71%`, `"Volume Mensal de Estrada" — 340 / 500 km · 68%`).
     - **7-Day Distance Evolution Bar Chart Card (Pure Surface #FFFFFF, 16px radius, 1px #E4E4E7, 24px padding):** Header with Section H2 `"Distância nos últimos 7 dias"` + right-aligned JetBrains Mono weekly total pill `"184,2 km"`; clean vertical bar chart (`Seg` `18,5`, `Ter` `0`, `Qua` `34,2`, `Qui` `26,8`, `Sex` `14,1`, `Sáb` `62,4` peak highlighted in Deep Canopy #145340, `Dom` `28,2`) in Alpine Pine (#1B6B53) with 6px rounded bar tops, 1px Hairline Zinc (#E4E4E7) horizontal gridlines, and JetBrains Mono axis values.
   - *Right (`5fr`) — Compact "Últimas rotas" Feed Card (Pure Surface #FFFFFF, 16px radius, 1px #E4E4E7, 24px padding):* Header with Section H2 `"Últimas rotas"` + right `"Ver todas →"` link; vertical list of 5 recent rides separated strictly by 1px Hairline Zinc (#E4E4E7) horizontal dividers (NO nested cards!), each row showing Route Name (Geist 600) and JetBrains Mono date on the left, and right-aligned tabular Distance + Elevation (`48,4 km` / `+865 m`, `36,2 km` / `+310 m`, `72,6 km` / `+1.140 m`, `29,5 km` / `+740 m`, `64,5 km` / `+1.280 m`).
