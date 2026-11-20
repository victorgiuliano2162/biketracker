A structured, trustworthy athlete registration page collecting access credentials alongside cycling biometrics and medical emergency blood type.

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
1. **Public Sticky TopBar (64px height, Pure Surface #FFFFFF, 1px bottom border Hairline Zinc #E4E4E7):** Minimalist topographic contour / bike-route vector mark in Alpine Pine (#1B6B53) with bold Geist wordmark `"Tracker"` on the left; `"Já possui conta?"` text in Graphite Secondary (#52525B) paired with a secondary outline button `"Entrar"` (10px radius, 1px #E4E4E7 border) on the right.
2. **Centered Registration Card (max-width 640px, Pure Surface #FFFFFF, 16px radius, 1px Hairline Zinc #E4E4E7 border, 32px padding on Alabaster Zinc #FAFAFA canvas):** Page H1 `"Criar conta de atleta"` (Geist 700) and concise subtitle `"Configure seu perfil esportivo com dados biométricos e de emergência."` in Graphite Secondary (#52525B).
3. **Section 1 — Credenciais de Acesso (2-column CSS Grid, 20px gap, fixed labels strictly 8px above 48px-height inputs):** Full-width (span 2) `"Nome completo"` input (placeholder `"Marina Costa Ribeiro"`); full-width (span 2) `"E-mail"` input (placeholder `"marina.costa@exemplo.com.br"`); paired side-by-side `"Senha"` and `"Confirmar senha"` inputs (both with right-aligned 44px eye visibility toggles) plus concise 12px helper text 6px below in Steel Muted (#71717A): `"Mínimo 8 caracteres, 1 letra maiúscula e 1 número"`.
4. **Section 2 — Dados Biométricos e Emergência Médica (separated by 1px Hairline Zinc #E4E4E7 horizontal divider):** Section H2 `"Dados Biométricos e Emergência Médica"` paired with a thin monochrome medical-cross vector icon; 2-column CSS Grid (20px gap) containing paired `"Idade"` numeric input (`"31"` in JetBrains Mono with muted suffix `"anos"`) + `"Peso"` numeric input (`"64,5"` in JetBrains Mono with muted suffix `"kg"`); paired `"Data de nascimento"` date input (`"14/05/1995"` in JetBrains Mono, past date helper) + `"Tipo sanguíneo"` select dropdown showing all 8 options (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) with `"O+"` selected in JetBrains Mono.
5. **Form Footer:** Full-width 48px-height Alpine Pine (#1B6B53) primary submit button `"Criar conta"` and centered footer prompt `"Já tem uma conta?"` with `"Fazer login"` link in Alpine Pine (#1B6B53).
