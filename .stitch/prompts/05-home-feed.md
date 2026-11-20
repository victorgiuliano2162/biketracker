A crisp, spacious community cycling route discovery feed featuring GPS proximity radius controls and a 2-column architectural card grid with tabular telemetry.

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
   - Center-left horizontal menu: `"Home"` (ACTIVE — highlighted in Alpine Pine #1B6B53 text with a crisp 2px bottom underline / Alpine Tint #EFF7F4 pill), `"Mapas"` (with subtle chevron dropdown indicator), `"Status"` (with subtle chevron dropdown indicator).
   - Right user area: Ghost button `"Perfil"` (user outline vector icon) and secondary outline button `"Sair"` (logout icon, 1px #E4E4E7 border).
2. **Page Header (max-width 1400px centered, 48px horizontal padding):** Left H1 `"Explorar rotas públicas"` (Geist 700) + concise subtitle `"Percursos de ciclismo compartilhados pela comunidade com telemetria verificada."` in Graphite Secondary (#52525B); Right active filter status pill in Alpine Tint (#EFF7F4) with Alpine Pine (#1B6B53) text showing `"Raio de 35 km · Campinas, BR"` (using JetBrains Mono for `35 km` and `BR`).
3. **Integrated Geolocation & Radius Control Bar (Pure Surface #FFFFFF card, 16px radius, 1px Hairline Zinc #E4E4E7 border, 16px–20px padding):** Horizontal flex/grid toolbar featuring: left outline/active button `"Usar minha localização"` (44px height, GPS crosshair vector icon in #1B6B53); center labeled horizontal range slider `"Raio de busca"` (`5 km` to `100 km`, Alpine Pine #1B6B53 active fill track, circular thumb, current value `"35 km"` displayed in bold JetBrains Mono); right-aligned ghost action button `"Limpar filtro"` (44px height).
4. **Strict 2-Column Architectural Route Card Grid (`grid-template-columns: repeat(2, minmax(0, 1fr))`, 24px gap — NEVER 3 columns):** Render 6 spacious architectural route cards (Pure Surface #FFFFFF, 16px radius, 1px Hairline Zinc #E4E4E7 border, 24px padding). Each card contains:
   - Top row: Route name (Card H3 Geist 600 in Obsidian Ink #18181B) + right-aligned pill-shaped Difficulty Tag (`EASY` #15803D on #ECFDF3, `MODERATE` #B45309 on #FEF3C7, `HARD` #C2410C on #FFF7ED, `EXPERT` #C93B3B on #FEF2F2).
   - Metadata row: Author name with user icon, location with monospaced ISO code (`BR` — NO emoji flags), and timestamp in JetBrains Mono (`dd/MM/yyyy · HH:mm`).
   - Hairline Zinc (#E4E4E7) horizontal divider + Telemetry Footer: `Distância` (`km`) and `Elevação` (`+m`) in bold JetBrains Mono tabular figures paired with a crisp minimal Alpine Pine (#1B6B53) elevation profile sparkline SVG on the right.
   - Populate the 6 cards with these exact realistic Brazilian cycling routes:
     1) `"Serra do Japi — Loop Norte"` · `HARD` · Marina Costa · `Jundiaí, BR` · `14/11/2026 · 06:42` · `48,4 km` · `+865 m`
     2) `"Estrada dos Romeiros — Pirapora"` · `MODERATE` · Rafael Nogueira · `Cabreúva, BR` · `13/11/2026 · 07:15` · `72,6 km` · `+1.140 m`
     3) `"Subida do Pico do Jaraguá"` · `EXPERT` · Camila Rezende · `São Paulo, BR` · `12/11/2026 · 06:08` · `26,2 km` · `+690 m`
     4) `"Ciclovia Marginal & Villa-Lobos"` · `EASY` · Thiago Alencar · `São Paulo, BR` · `10/11/2026 · 17:30` · `31,8 km` · `+185 m`
     5) `"Circuito das Frutas — Morungaba"` · `HARD` · Lucas Ferreira · `Morungaba, BR` · `09/11/2026 · 06:20` · `64,5 km` · `+1.280 m`
     6) `"Trilha da Pedra Grande — Atibaia"` · `MODERATE` · Beatriz Duarte · `Atibaia, BR` · `08/11/2026 · 07:05` · `41,0 km` · `+920 m`
5. **Pagination Bar:** Clean bottom bar with left status text `"Mostrando 1–6 de 42 rotas"` in JetBrains Mono (#71717A) and right-aligned 44px tactile page buttons (`"Anterior"`, `1` active in Alpine Pine #1B6B53 with white text, `2`, `3`, `...`, `7`, `"Próxima"`).
