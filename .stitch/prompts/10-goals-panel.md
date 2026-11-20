A high-clarity athlete training goals tracking table featuring tabular progress ratios, color-coded completion and deadline states, and inline management actions.

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
2. **Page Header (max-width 1400px centered, 48px horizontal padding):** Left H1 `"Minhas metas"` (Geist 700) + concise summary subtitle `"4 em andamento · 1 concluída · 1 expirada"` in Graphite Secondary (#52525B); Right Alpine Pine (#1B6B53) primary CTA button `"+ Nova meta"` (44px height).
3. **Proportional Horizontal Goals Data Table (Pure Surface #FFFFFF container, 16px radius, 1px Hairline Zinc #E4E4E7 border, header row in Cloud Mist #F4F4F5, comfortable 64px+ rows separated by 1px Hairline Zinc dividers):**
   - Proportional columns: `Meta e Descrição (35%)` | `Progresso (35%)` | `Prazo (15%)` | `Ações (15%, right-aligned)`.
   - In each row's `Progresso` cell, place an 8px-height pill-shaped (`9999px`) progress track (Cloud Mist #F4F4F5 background) cleanly ABOVE the right-aligned tabular JetBrains Mono ratio (`atual / alvo unidade · %`). In `Ações`, display 44px × 44px tactile ghost icon buttons for `Editar` (pencil icon) and `Excluir` (trash icon, Crimson hover).
   - Display these 6 realistic cycling goals covering all units (`km`, `metros`, `rides`, `horas`) and semantic states:
     1) `"Volume Mensal de Estrada"` — `"Base aeróbica semanal em rodovia"` · `340 / 500 km · 68%` (Alpine Pine #1B6B53 bar) · Prazo `30/11/2026`
     2) `"Desafio de Altimetria Alpina"` — `"Subidas acumuladas na Serra do Japi"` · `4.850 / 6.000 metros · 81%` (Alpine Pine #1B6B53 bar) · Prazo `22/11/2026` with Ochre Terrain pill (`#B45309` on `#FEF3C7`, `"3 dias restantes"`)
     3) `"Travessia Mantiqueira Prep"` — `"Simulado de longa distância em serra"` · `300 / 300 km · 100%` (Emerald Goal Complete #15803D full bar + `#ECFDF3` pill `"Concluída"`) · Prazo `25/11/2026`
     4) `"Consistência de Pedaladas"` — `"Sessões contínuas ao longo do mês"` · `14 / 20 rides · 70%` (Alpine Pine #1B6B53 bar) · Prazo `15/12/2026`
     5) `"Base Aeróbica em Selim"` — `"Tempo líquido em zona aeróbica Z2"` · `28,5 / 40 horas · 71%` (Alpine Pine #1B6B53 bar) · Prazo `20/12/2026`
     6) `"Bloco de Montanha Outubro"` — `"Volume de escalada em treinos curtos"` · `1.920 / 3.000 metros · 64%` (Crimson Alert #C93B3B muted bar) · Prazo `31/10/2026` with Crimson Alert pill (`#C93B3B` on `#FEF2F2`, `"Expirada"`)
