A calm, focused password recovery page sharing the asymmetric Swiss cartographic split-screen layout for seamless authentication continuity.

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
1. **Asymmetric Split-Screen Layout (min-height 100dvh, 55% Left / 45% Right):** Left Swiss topographic contour map panel in subtle Cloud Mist (#F4F4F5) matching the login page, featuring clean contour lines, a crisp Alpine Pine (#1B6B53) GPX route trace, and a bottom-left Frosted HUD telemetry card (20px radius, 1px #E4E4E7 border) displaying `"Estrada dos Romeiros"` with JetBrains Mono metrics (`"72,6 km"`, `"+1.140 m"`, `"Cabreúva, BR"`).
2. **Right Recovery Column (45%, centered form container max-width 440px):** Top `"Tracker"` logo lockup (Alpine Pine topographic vector mark + bold Geist wordmark) and clean back navigation link `"← Voltar para o login"` (44px touch target height); Page H1 `"Recuperar senha"` (Geist 700) and concise guidance copy `"Informe o e-mail cadastrado para receber um link seguro e temporário de redefinição."` in Graphite Secondary (#52525B).
3. **Recovery Form:** Fixed `"E-mail"` label 8px above a 48px Pure Surface (#FFFFFF) input field filled with `"marina.costa@exemplo.com.br"`, followed by a full-width 48px Alpine Pine (#1B6B53) primary submit button `"Enviar link de recuperação"`.
4. **Inline Confirmation State Card:** Subtle inline feedback alert box positioned cleanly below the submit button (Alpine Tint #EFF7F4 background, 1px Alpine Pine #1B6B53 at 25% opacity border, 10px radius, crisp check-circle vector icon in #1B6B53) displaying `"Verifique seu e-mail — se o endereço estiver cadastrado, enviamos um link válido por 30 minutos."`
