An immersive, full-viewport GPX cartographic mapping studio inspired by Swiss topographic instruments with translucent Frosted HUD controls and a live synchronized elevation profile.

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
2. **Full-Viewport Interactive Vector Map (min-height calc(100dvh - 64px), edge-to-edge full width):** Bright minimalist Swiss topographic vector map canvas with subtle terrain relief, elevation contour lines, clean road geometry, and **3 overlaid GPX polylines** using the exclusive cartographic track palette:
   - Active primary track in Alpine Pine (#1B6B53, 3.5px stroke) with Start/Finish pins and a crisp active circular position marker along the midpoint climb.
   - Secondary comparison track 1 in Cobalt Track (#2563EB, 2.5px stroke).
   - Secondary comparison track 2 in Terracotta Trail (#C84B31, 2.5px stroke).
3. **Collapsible Left Layers Sidebar (320px width, floating Frosted HUD rgba(255, 255, 255, 0.88) with backdrop-filter blur 12px, 20px radius, 1px Hairline Zinc #E4E4E7 border, Whisper Elevation shadow, 16px margin):**
   - Sidebar header: `"Camadas GPX"` (Geist 600) with JetBrains Mono count pill `"3"` (`#F4F4F5`) and panel-collapse chevron icon button.
   - Hierarchical tree list of loaded `.gpx` tracks with visibility checkboxes, track color swatch dots (`#1B6B53`, `#2563EB`, `#C84B31`), filenames (`serra_do_japi_norte.gpx` active row highlighted in Alpine Tint #EFF7F4, `morungaba_volta.gpx`, `atibaia_base.gpx`), JetBrains Mono distance and elevation subtitles (`48,4 km · +865 m`, `64,5 km · +1.280 m`, `41,0 km · +920 m`), and individual compact `"Salvar"` action buttons.
4. **Top-Right Floating Quick-Action Toolbar (Frosted HUD rgba(255, 255, 255, 0.88), 20px radius, 1px #E4E4E7 border, Whisper Elevation shadow, 16px top/right margin):** Horizontal control strip with tactile 44px controls: circular GPS crosshair button (`title="Minha localização"`), secondary button `"Importar GPX"` with upload icon, Alpine Pine (#1B6B53) primary button `"Salvar rota"`, and ghost trash-icon button `"Limpar mapa"`.
5. **Bottom Floating Synchronized Elevation Panel (positioned to the right of the sidebar with 16px floating margins, 20px radius, Frosted HUD rgba(255, 255, 255, 0.88), 1px #E4E4E7 border, Whisper Elevation shadow):**
   - Header bar showing active route title `"Serra do Japi — Loop Norte"` on the left, paired on the right with tabular JetBrains Mono telemetry pills: `"1.842 pontos"`, `"48,4 km"`, `"+865 m"`.
   - Synchronized topographic elevation profile chart (distance `km` × altitude `m`): crisp 2px Alpine Pine (#1B6B53) curve with translucent Alpine Tint (#EFF7F4) area gradient fill, JetBrains Mono axis ticks (`0 km` to `48,4 km`, `700 m` to `1.250 m`), and a vertical crosshair guide line at `28,4 km` with a floating monospaced tooltip (`"28,4 km · 1.142 m · +6,8%"`) visually synchronized with the circular marker on the map track directly above.
