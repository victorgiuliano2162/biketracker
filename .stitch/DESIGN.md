# Design System: Tracker
**Escopo:** Plataforma Web Responsiva de Telemetria GPX, Exploração de Rotas e Metas de Ciclismo (Desktop e Mobile)
**Base Funcional:** `docs/APP_ARCHITECTURE.md`

---

## Configuração de Direção Estética (Dials)

| Dimensão | Nível | Diretriz Aplicada ao Tracker |
| :--- | :---: | :--- |
| **Criatividade** | `6` | Precisão esportiva e editorial limpa — estética inspirada em instrumentos cartográficos suíços e equipamentos modernos de ciclismo, sem exageros ornamentais que prejudiquem a leitura de mapas e gráficos. |
| **Densidade** | `5` (HUD: `7`) | Equilibrada em feeds, formulários e metas; maior densidade informacional e números estritamente monoespaçados nos painéis de telemetria (`/map` e `/routes/:id`). |
| **Variância** | `6` | Grids assimétricos e composições Bento intencionais no dashboard e na autenticação; sem repetições monótonas de 3 cards idênticos lado a lado. |
| **Intenção de Movimento** | `5` | Física de mola contida e responsiva para microinterações, sincronia mapa-gráfico e transições de gavetas/modais, priorizando sensação imediata de ciclocomputador. |

---

## 1. Tema Visual e Atmosfera

O **Tracker** adota uma estética de **precisão cartográfica minimalista e telemetria alpina**. A atmosfera é **limpa, iluminada, técnica e respirável** — semelhante a um estúdio de design industrial focado em equipamentos de ciclismo de alta performance, onde mapas topográficos, curvas de altimetria e números de distância são os protagonistas absolutos.

A interface evita ruído decorativo e sobrecarga cromática para que o conteúdo real do atleta (traçados vetoriais GPX, relevo acumulado, fotos de trilhas e progresso de metas) domine a hierarquia visual. Superfícies neutras em tons frios-neutros de zinco criam contraste impecável sob luz solar intensa (uso mobile em campo) e em monitores de alta resolução (análise de rotas em desktop), ancoradas por um único acento verde-alpino profundo e confiante.

**Características-Chave:**
- Fundo arquitetural claro e neutro que valoriza mapas Leaflet e fotografia de trilhas.
- Hierarquia guiada por contraste tipográfico, peso de fonte e números tabulares monoespaçados.
- Separação espacial limpa por linhas finas estruturais e espaço negativo generoso, reservando elevação (sombras difusas) apenas para camadas flutuantes (HUDs de mapa e modais).
- Continuidade rigorosa entre desktop (análise expansiva) e mobile (operação ágil com uma mão e alvos táteis amplos).

---

## 2. Paleta de Cores e Papéis Funcionais

Toda a base neutra segue estritamente uma **escala única de Zinco (Zinc)**, garantindo zero flutuação entre cinzas quentes e frios. O preto puro (`#000000`) é proibido.

### Fundações e Superfícies (Base Neutra Única)
- **Alabaster Zinc** (`#FAFAFA`) — Superfície principal de fundo da aplicação (canvas). Mais suave e confortável aos olhos do que branco absoluto.
- **Pure Surface** (`#FFFFFF`) — Preenchimento de cards estruturais, tabelas, campos de formulário, barras superiores e modais.
- **Cloud Mist** (`#F4F4F5`) — Superfícies secundárias rebaixadas, fundos de badges neutros, cabeçalhos de tabela, estados hover sutis e faixas de progresso inativas.
- **Frosted HUD** (`rgba(255, 255, 255, 0.88)`) — Camada translúcida com desfoque de fundo (`backdrop-filter: blur(12px)`) exclusiva para controles flutuantes e painel de elevação sobre o mapa em `/map`.

### Hierarquia Tipográfica e Estrutural
- **Obsidian Ink** (`#18181B`) — Texto primário, títulos, cabeçalhos de seção e valores numéricos de KPI. Alto contraste (nível AAA) sem a rigidez do preto puro.
- **Graphite Secondary** (`#52525B`) — Texto de corpo, descrições de rotas/metas e rótulos de formulário.
- **Steel Muted** (`#71717A`) — Metadados secundários, unidades de medida (`km`, `m`), datas, placeholders de inputs e ícones inativos.
- **Hairline Zinc** (`rgba(228, 228, 231, 0.85)` / `#E4E4E7`) — Bordas estruturais de `1px`, divisores horizontais e contornos de inputs em estado padrão.
- **Whisper Elevation Shadow** (`rgba(24, 24, 27, 0.06)`) — Sombra difusa e controlada reservada para hover de cards interativos, HUDs do mapa e modais (`0 12px 32px -12px rgba(24, 24, 27, 0.08)`).

### Acento Único da Marca (Saturação < 80%)
- **Alpine Pine** (`#1B6B53`) — Único acento primário da interface (saturação 59,7%, contraste 6,4:1 com branco). Aplicado exclusivamente em botões primários (CTAs como "Entrar", "Salvar rota", "Nova meta", "Baixar GPX"), estados de foco de inputs, abas/links ativos, preenchimento de barras de progresso de metas e cursor ativo do perfil de elevação.
- **Deep Canopy** (`#145340`) — Estado hover e pressionado (active) do acento primário.
- **Alpine Tint** (`#EFF7F4`) — Preenchimento suave para estados selecionados, pills de rota pública, área sob a curva do gráfico de elevação e destaque de foco em filtros ativos.

### Estados Semânticos e Domínio Esportivo (Uso Estritamente Funcional)
- **Emerald Goal Complete** (`#15803D`, fundo `#ECFDF3`) — Metas concluídas (100%), feedback de rota salva com sucesso, validação NSFW aprovada e nível de dificuldade `EASY`.
- **Ochre Terrain** (`#B45309`, fundo `#FEF3C7`) — Alertas de atenção, prazo próximo do vencimento e nível de dificuldade `MODERATE`.
- **Burnt Clay** (`#C2410C`, fundo `#FFF7ED`) — Nível de dificuldade `HARD` e trechos de inclinação acentuada no perfil altimétrico.
- **Crimson Alert** (`#C93B3B`, fundo `#FEF2F2`) — Erros de validação inline, metas expiradas, rejeição de imagem pela moderação IA, ações destrutivas ("Excluir rota/meta") e nível de dificuldade `EXPERT`.
- **Slate Private** (`#475569`, fundo `#F1F5F9`) — Badge semântico para rotas com visibilidade **Privada** (contrastando claramente com **Alpine Pine** `#1B6B53` sobre `#EFF7F4` para rotas **Públicas**).

### Paleta Cartográfica Exclusiva para Múltiplas Camadas GPX (`/map`)
Reservada unicamente para diferenciar polilinhas sobrepostas no mapa Leaflet e seus indicadores na árvore lateral (nunca utilizada como cor de UI):
- Traço Principal / Ativo: **Alpine Pine** (`#1B6B53`)
- Traços Comparativos Secundários: **Cobalt Track** (`#2563EB`), **Terracotta Trail** (`#C84B31`), **Ochre Ridge** (`#B45309`), **Slate Violet** (`#6D28D9`), **Teal River** (`#0F766E`).

### Cores Proibidas
- Gradientes roxos/azuis neon ("AI Purple/Blue").
- Preto absoluto (`#000000`) em fundos, textos ou sombras.
- Cores de acento com saturação acima de 80%.
- Mistura de cinzas quentes (Stone/Warm Gray) com cinzas frios (Slate/Zinc) na mesma tela.

---

## 3. Arquitetura Tipográfica

A aplicação adota um par exclusivamente **Sans-Serif + Monospace**, proibindo fontes serifadas em qualquer tela operacional e banindo `Inter`.

- **Família Primária (Display e Interface):** `Geist` — Geométrica contemporânea, legibilidade cirúrgica em telas de alta e baixa densidade, excelente equilíbrio para UI esportiva e analítica.
- **Família Numérica e Telemetria (Mono):** `JetBrains Mono` — Aplicada obrigatoriamente com `font-variant-numeric: tabular-nums` em todos os valores numéricos críticos (distância em `km`, elevação acumulada/média em `m`, contagem de pontos GPX, coordenadas, porcentagens de metas, datas de prazo e escalas de gráficos).

### Escala Tipográfica e Hierarquia

| Nível | Família | Peso | Tamanho (Fluido / Fixo) | Line-Height | Tracking | Uso Principal |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **Display / Page H1** | `Geist` | 700 | `clamp(1.75rem, 3vw, 2.5rem)` (`28px–40px`) | `1.12` | `-0.025em` | Título de páginas principais (`/home`, `/status`, `/routes/:id`, tela de login). |
| **Section H2** | `Geist` | 600 | `clamp(1.25rem, 2vw, 1.5rem)` (`20px–24px`) | `1.25` | `-0.02em` | Títulos de seções, modais e grupos de formulário ("Últimas rotas", "Mapa", "Perfil Altimétrico"). |
| **Card / Item H3** | `Geist` | 600 | `1.0625rem` (`17px`) | `1.35` | `-0.01em` | Nome da rota nos cards, nome da meta, cabeçalho de rascunho de meta ("Meta 1"). |
| **KPI Telemetry Value** | `JetBrains Mono` | 600 | `clamp(1.5rem, 2.5vw, 2.125rem)` (`24px–34px`) | `1.1` | `-0.03em` | Números hero de distância total, elevação acumulada e estatísticas de destaque. |
| **Inline Metric** | `JetBrains Mono` | 500 | `0.9375rem` (`15px`) | `1.3` | `-0.01em` | Métricas em cards de rota, colunas de progresso na tabela de metas e tooltips do gráfico. |
| **Body / UI Default** | `Geist` | 400 | `1rem` (`16px` desktop / mín. `14px` compacto) | `1.6` | `0em` | Descrições de metas, textos de orientação, labels de menu e estados vazios. Medida máxima de `65ch`. |
| **Label / Micro-Meta** | `Geist` | 500 | `0.8125rem` (`13px`) | `1.4` | `0.01em` | Labels acima de inputs, cabeçalhos de tabela (caixa mista ou uppercase discreto `0.04em`), tags de dificuldade e timestamps. |
| **Mono Micro-Tag** | `JetBrains Mono` | 500 | `0.75rem` (`12px`) | `1.3` | `0.02em` | Códigos de país (`BR`, `PT`), contagem de pontos GPS e rótulos de eixo dos gráficos. |

### Fontes Proibidas
- `Inter` (banida em toda a aplicação).
- Fontes serifadas genéricas (`Times New Roman`, `Georgia`, `Garamond`, `Palatino`) e qualquer fonte serifada em dashboards, tabelas ou formulários.

---

## 4. Geometria, Raios de Borda e Sistema de Espaçamento

### Raios de Borda (Tradução Física e Precisão)
- **Contêineres Arquiteturais e Cards Principais:** Cantos suavemente arredondados (`16px` / `1rem`) — usado em cards de rotas (`/home`, `/routes`), containers de KPI (`/status`), container da tabela (`/goals`) e cards de rascunho de metas (`/goal`).
- **Modais, Drawers e Painéis Flutuantes HUD:** Cantos amplamente curvados (`20px` / `1.25rem`) — usado em `SaveRouteDialog`, `GoalEditDialog`, `ImageLightbox` e no painel flutuante de elevação em `/map`. No mobile (`< 768px`), modais viram *bottom sheets* com arredondamento apenas nos cantos superiores (`20px 20px 0 0`).
- **Controles Interativos (Botões, Inputs, Selects, Toggles):** Cantos sutilmente arredondados de precisão (`10px` / `0.625rem`) — alinha visualmente botões, campos de formulário e seletores segmentados.
- **Pills, Badges, Chips de Privacidade e Tags de Dificuldade:** Formato cápsula completo (*pill-shaped*, `9999px`).
- **Botões Flutuantes de Ação no Mapa:** Discos circulares táteis (`9999px`, dimensão mínima `44px × 44px`).
- **Barras de Progresso e Skeletons:** Extremidades suavemente arredondadas (`9999px` para trilhas de progresso de `8px` de altura; `8px` para blocos de shimmer).

### Escala de Espaçamento (Ritmo Base de 8px)
- **Micro-espaçamento (`4px` / `0.25rem` e `8px` / `0.5rem`):** Distância entre ícone e texto, espaço entre label e input (`8px`), espaço entre input e mensagem de erro (`6px`), espaço entre número e unidade.
- **Espaçamento Interno de Componentes (`16px` / `1rem` a `24px` / `1.5rem`):** Padding interno de cards (`24px` desktop, `16px` mobile), padding interno de células de tabela (`16px` horizontal, `14px` vertical), gap interno de grupos de botões (`12px`).
- **Ritmo de Grade e Blocos (`24px` / `1.5rem` e `32px` / `2rem`):** Gutter entre colunas de grid (`24px` desktop, `16px` mobile), separação entre blocos de formulário e cabeçalho de página.
- **Margens de Seção e Moldura de Viewport:**
  - Largura máxima de conteúdo: `1400px` centralizada (exceção: `/map` opera em largura total *edge-to-edge*).
  - Padding lateral da página: `16px` (`1rem`) no mobile, `32px` (`2rem`) no tablet, `48px` (`3rem`) no desktop.
  - Ritmo vertical entre seções maiores: fluido com `clamp(2rem, 4.5vw, 3.5rem)`.
  - Altura de telas inteiras (`/map`, `/login`): sempre `min-height: 100dvh` (nunca `100vh`).

---

## 5. Estilização de Componentes Principais

- **Botões:** Superfície plana, sem brilho externo (no glow) e sem sombras pesadas. Altura mínima de `44px` (`48px` em ações principais de autenticação). Padding horizontal de `20px–24px`.
  - *Primário:* Preenchimento **Alpine Pine** (`#1B6B53`), texto branco (`#FFFFFF`), hover **Deep Canopy** (`#145340`), estado pressionado com leve afundamento tátil (`scale(0.98)` ou `translateY(1px)`).
  - *Secundário / Outline:* Fundo transparente ou **Pure Surface** (`#FFFFFF`), borda `1px` em **Hairline Zinc** (`#E4E4E7`), texto **Obsidian Ink** (`#18181B`), hover em **Cloud Mist** (`#F4F4F5`).
  - *Ghost / Ações de Ícone:* Sem borda, hover suave em **Cloud Mist** (`#F4F4F5`), alvo tátil mínimo `44px × 44px`.
  - *Destrutivo:* Fundo **Crimson Alert** (`#C93B3B`) para confirmação final ou outline vermelho (`#C93B3B`) em menus e ações de linha.
- **Cards e Listas Estruturais:** Fundo **Pure Surface** (`#FFFFFF`), borda fina `1px` em **Hairline Zinc** (`#E4E4E7`), cantos suavemente arredondados (`16px`). Planos por padrão; cards clicáveis (`/home`, `/routes`) recebem transição de borda para `#D4D4D8` e sombra difusa sutil (`0 12px 32px -12px rgba(24, 24, 27, 0.08)`) com elevação discreta (`translateY(-2px)`) no hover. Em listas densas internas (como "Últimas rotas" no `/status`), substituir cards aninhados por divisores horizontais de `1px` em **Hairline Zinc**.
- **Navegação Global (TopBar):** Barra fixa superior (*sticky*) de `64px` de altura em **Pure Surface** (`#FFFFFF`) com borda inferior `1px` em **Hairline Zinc**.
  - *Desktop (`>= 1024px`):* Marca **Tracker** à esquerda; navegação horizontal limpa ao centro/esquerda (`Home`, `Mapas` com dropdown para Estúdio GPX e Minhas Rotas, `Status` com dropdown para Minhas Metas, Criar Metas e Estatísticas) com indicador de rota ativa em **Alpine Pine** (`#1B6B53`, sublinhado fino de `2px` ou pill **Alpine Tint**); controles de usuário (`Perfil`, `Sair` ou CTA "Inscrever-se" quando deslogado) à direita.
  - *Mobile (`< 768px`):* Marca **Tracker** à esquerda e botão rotulado `Menu` (`44px` de altura mínima) à direita, abrindo um painel deslizante lateral/completo com links empilhados de `48px` de altura e acesso direto a `Perfil` e `Sair`.
- **Controles de Visibilidade (Pública vs. Privada):** Chip interativo em formato cápsula (`9999px`, altura `32px` desktop / `36px` mobile dentro de área clicável `44px`) com ícone vetorial + rótulo explícito. *Pública:* ícone de globo, fundo **Alpine Tint** (`#EFF7F4`), texto `#1B6B53`. *Privada:* ícone de cadeado, fundo **Slate Private** (`#F1F5F9`), texto `#475569`.
- **Estados de Carregamento (Loaders):** Estritamente **Skeleton Shimmers** em **Cloud Mist** (`#F4F4F5`) com reflexo animado sutil, replicando exatamente a geometria dos cards de rota, linhas da tabela de metas, KPIs e áreas de gráfico. Spinners circulares genéricos são banidos (exceção restrita a indicadores inline de 16px dentro de botões em estado "Salvando..." ou na miniatura de foto em validação IA NSFW).
- **Estados Vazios (Empty States):** Composição estruturada com ícone vetorial fino (`32px–40px` em **Steel Muted** dentro de container circular **Cloud Mist**), título claro em **Obsidian Ink**, orientação curta em **Graphite Secondary** e exatamente 1 botão de ação para popular dados (ex.: "Importar primeiro arquivo GPX" ou "Criar primeira meta").
- **Mapas e Painel de Elevação Sincronizado (`/map` e `/routes/:id`):**
  - Controles flutuantes em **Frosted HUD** com borda `1px` em **Hairline Zinc** e sombra difusa.
  - Gráfico de elevação com linha nítida de `2px` em **Alpine Pine** (`#1B6B53`), preenchimento em gradiente suave vertical de **Alpine Tint** para transparente, linha guia vertical (*crosshair*) no hover e tooltip flutuante monoespaçado exibindo distância (`km`) e altitude (`m`) sincronizado em tempo real com o marcador circular no traçado do mapa.

---

## 6. Princípios de Layout e Arquitetura por Contexto

- **Grid-First (CSS Grid Exclusivo):** Todo layout estrutural utiliza CSS Grid (`grid-template-columns`, `gap`) — cálculos percentuais em flexbox (`calc(33% - 1rem)`) são proibidos.
- **Separação Espacial Limpa:** Nenhum texto pode se sobrepor diretamente a fotos ou elementos de mapa sem estar encapsulado em uma zona dedicada (como barra **Frosted HUD** ou rodapé de card sólido).
- **Layouts Assimétricos e Intencionais (Proibição de 3 Cards Iguais):**
  - **Autenticação (`/login`, `/forgot-password`, `/reset-password`):** Split-screen assimétrico no desktop (`55%` painel editorial à esquerda com mapa topográfico estilizado e resumo de telemetria real / `45%` coluna limpa de formulário à direita com `max-width: 440px`). Colapsa para coluna única no mobile sem a ilustração pesada, mantendo cabeçalho limpo de marca.
  - **Feed de Rotas Públicas (`/home`):** Barra superior de cabeçalho + barra integrada de geolocalização e slider de raio (`5 km` a `100 km`), seguida por grid de **2 colunas** (`grid-template-columns: repeat(2, minmax(0, 1fr))`) no desktop para dar amplitude às métricas e metadados de cada rota, com paginação ancorada abaixo.
  - **Dashboard de Performance (`/status`):** Arquitetura Bento assimétrica:
    - *Faixa 1:* Banner de boas-vindas adaptativo (esquerda, `7fr`) + KPIs acumulados de Distância Total e Elevação Total lado a lado (direita, `5fr`).
    - *Faixa 2:* Metas em andamento e gráfico de barras dos últimos 7 dias (`7fr`) + Feed compacto "Últimas rotas" com divisores finos (`5fr`).
  - **Detalhes da Rota (`/routes/:id`):** Cabeçalho executivo com ações (`Baixar GPX`, chip de visibilidade, menu `...`) -> Faixa de 3 métricas analíticas em barra unificada com divisores verticais (Distância, Elevação Acumulada, Elevação Média) -> Mapa amplo (`aspect-ratio: 16/7` desktop, `4/3` mobile) -> Gráfico altimétrico full-width sincronizado -> Galeria de fotos em grid responsivo com abertura em Lightbox.
  - **Estúdio GPX (`/map`):** Viewport completo (`min-height: calc(100dvh - 64px)`). Mapa ocupa 100% do canvas; barra lateral retrátil de camadas (`320px`) desliza pela esquerda; barra flutuante de ferramentas (GPS, Upload GPX, Salvar, Limpar) ancora no canto superior direito; painel de elevação acopla na base com margem flutuante (`16px`).

---

## 7. Regras de Comportamento Responsivo (Breakpoints, Tabelas e Formulários)

A responsividade é requisito estrutural inegociável. **Zero scroll horizontal** em qualquer viewport. Breakpoints oficiais:
- **Mobile:** `< 768px` (testado em `375px` e `390px`)
- **Tablet:** `768px – 1023px` (testado em `768px`)
- **Desktop:** `>= 1024px` (testado em `1024px` e `1440px`)

### 7.1 Regras Responsivas para Tabelas (Ex.: Painel de Metas `/goals` e Listagens)

| Viewport | Comportamento Estrutural | Hierarquia e Interação |
| :--- | :--- | :--- |
| **Desktop (`>= 1024px`)** | Tabela horizontal completa encapsulada em container `16px` de raio com borda `1px` em **Hairline Zinc**. Colunas proporcionais: `Meta e Descrição (35%)`, `Progresso Visual + Ratio (35%)`, `Prazo (15%)`, `Ações (15%, fixadas à direita)`. | Altura de linha confortável (`64px`), valores e datas em `JetBrains Mono` alinhados à direita/tabular, barra de progresso linear (`8px` de altura) acima do texto `atual / alvo unidade (%)`. Prazo expirado em pill **Crimson Alert**. |
| **Tablet (`768px–1023px`)** | Mantém tabela horizontal fluida com compactação inteligente: descrição secundária limitada a 1 linha com reticências (`text-overflow: ellipsis`), padding horizontal reduzido para `12px`, barra de progresso reduzida para largura mínima de `140px`. | Nenhuma quebra de número ou sobreposição de colunas; ações permanecem acessíveis com mínimo `44px` de área clicável. |
| **Mobile (`< 768px`)** | **Transformação Obrigatória para Pilha de Cards (Card-Stack).** O cabeçalho `<thead>` é ocultado e cada linha `<tr>` transforma-se em um card individual de largura `100%`, padding `16px` e espaçamento vertical `12px` entre itens. **Proibido scroll horizontal em tabelas.** | **Ordem vertical fixa dentro do card mobile:**<br>1. *Topo:* Nome da meta (`H3`) + Badge de status/prazo expirado à direita.<br>2. *Descrição:* Até 2 linhas em **Graphite Secondary**.<br>3. *Bloco de Progresso (largura total):* Barra de progresso + ratio tabular (`340 / 500 km · 68%`).<br>4. *Rodapé dividido por hairline:* Data do prazo à esquerda + botões táteis de `Editar` e `Excluir` (`44px × 44px` cada) à direita. |

*(A tela `/routes` — Minhas Rotas — segue a mesma lógica: linha estruturada de 3 zonas no desktop [Nome+Data | Métricas | Privacidade+Menu] colapsando no mobile para cabeçalho com Nome/Data, faixa central de métricas lado a lado e rodapé com toggle de visibilidade e menu contextual.)*

### 7.2 Regras Responsivas para Formulários (Ex.: `/subscribe`, `/goal`, `SaveRouteDialog`, Auth)

**Anatomia Universal de Campo (Todos os Viewports):**
- Rótulo (`<label>`) **sempre posicionado acima do campo** (`8px` de distância). Labels flutuantes (estilo Material Outline) são banidos.
- Altura mínima de input/select: `44px` (`48px` em login/cadastro) para ergonomia de toque.
- Borda `1px` em **Hairline Zinc** (`#E4E4E7`), fundo **Pure Surface** (`#FFFFFF`), foco com borda **Alpine Pine** (`#1B6B53`) e anel suave (`box-shadow: 0 0 0 3px rgba(27, 107, 83, 0.14)`).
- Texto de ajuda opcional (`12px` em **Steel Muted**) ou mensagem de erro de validação (`12px` em **Crimson Alert** `#C93B3B`) **sempre posicionados abaixo do input** (`6px` de distância), reservando ritmo limpo sem saltos bruscos.

| Contexto de Formulário | Desktop (`>= 1024px`) & Tablet (`>= 768px`) | Mobile (`< 768px`) |
| :--- | :--- | :--- |
| **Cadastro Completo (`/subscribe`)** | Grid de **2 colunas** (`gap: 20px`) dentro de container `max-width: 640px`. Campos de largura total (`span 2`): Nome completo, E-mail. Campos pareados lado a lado: Senha + Confirmar senha; Idade + Peso (`kg`); Data de nascimento + Tipo Sanguíneo (`A+`, `O-`, etc.). Divisor discreto separa "Credenciais" de "Dados Biométricos e Emergência". | **Colapso estrito para 1 coluna (`1fr`, `width: 100%`, `gap: 16px`).** Teclados numéricos (`inputmode="numeric"`/`"decimal"`) para idade e peso. Botão principal "Criar conta" ocupa `100%` da largura (`48px` de altura). |
| **Criação de Metas em Lote (`/goal`)** | Cada rascunho ("Meta 1", "Meta 2") é um card estruturado com grid de **2 colunas**: Nome (`span 2`), Descrição (`span 2`), Valor alvo + Unidade (pareados), Prazo (`span 2` ou pareado). Rodapé de ações posiciona "Adicionar outra meta" (outline) à esquerda e "Salvar Metas" (primário) à direita. | Cards empilhados em **1 coluna** com padding `16px`. Todos os campos ocupam `100%` da largura. Rodapé empilha botões em largura total: CTA primário "Salvar Metas" no topo (ou fixo na base) e "Adicionar outra meta" abaixo. |
| **Modal Salvar Rota (`SaveRouteDialog`) e Editar Meta (`GoalEditDialog`)** | Diálogo centralizado (`max-width: 560px`, raio `20px`) com cabeçalho fixo contendo o resumo imutável de Distância e Elevação em `JetBrains Mono`, corpo rolável com toggle segmentado `Privada | Pública`, dropzone de fotos com pré-visualização em grade de 4 colunas e rodapé fixo com botões alinhados à direita. | **Transformação em Bottom Sheet (`width: 100%`, `max-height: 92dvh`, cantos superiores `20px`).** Toggle `Privada | Pública` ocupa `100%` da largura (`44px` de altura). Dropzone de fotos converte-se em área de toque compacta (`min-height: 88px`) com grade de miniaturas de 3 colunas e indicador claro de validação NSFW. Botões de rodapé em largura total. |
| **Autenticação (`/login`, `/forgot-password`, `/reset-password`)** | Coluna de formulário focada (`max-width: 440px`) dentro do layout split-screen assimétrico. Alternador de visualização de senha dentro do campo com alvo tátil `44px`. | Formulário ocupa `100%` da largura útil com padding lateral `16px`. Botão principal `100%` largura, link "Esqueci minha senha" com área clicável mínima de `44px` de altura. |

### 7.3 Regras Responsivas para Mapa e Controles Geográficos (`/map`, `/home`)
- **Estúdio GPX (`/map`) no Mobile (`< 768px`):** A barra lateral de camadas deixa de dividir a largura com o mapa e abre como um *bottom sheet* sobreposto (máx. `70dvh`). O painel de elevação inicia em modo compacto (resumo de distância + elevação) com botão para expandir o gráfico completo, preservando sempre a área interativa do mapa.
- **Filtro de Localização (`/home`) no Mobile:** Botão "Usar minha localização" e o slider de raio (`5 km – 100 km`) empilham verticalmente em largura total dentro de uma faixa retrátil limpa acima do feed.

---

## 8. Movimento e Interação (Intenção de Implementação)

> **Nota para Stitch e Implementação:** Telas geradas no Stitch são estáticas; estas especificações orientam a fidelidade de microinteração na fase de código Angular/CSS.

- **Física de Movimento:** Curvas de mola suaves (*spring physics* equivalente a `stiffness: 100, damping: 20` ou `cubic-bezier(0.22, 1, 0.36, 1)` de `220ms–320ms`). Evitar easing `linear` em transições de UI.
- **Microinterações Contínuas de Telemetria:**
  - Pulso discreto no marcador GPS do usuário ativo no mapa e no ponto sincronizado do traçado durante inspeção de elevação.
  - Reflexo contínuo (*shimmer*) nos skeleton loaders durante busca de rotas e carregamento de estatísticas.
- **Entrada Escalonada (Stagger):** Cards do feed `/home`, itens de `/routes` e linhas de `/goals` entram com cascata sutil (`opacity` + `translateY(8px)`, atraso de `40ms` por item, limitado aos primeiros 6 itens para sensação instantânea).
- **Regra de Performance (60fps):** Animar exclusivamente `transform` e `opacity`. Nunca animar `width`, `height`, `top` ou `left` diretamente em elementos de layout. Respeitar `prefers-reduced-motion: reduce`.

---

## 9. Anti-Padrões Explicitamente Proibidos (Never Do)

1. **Zero Emojis em toda a interface:** Não usar emojis em títulos, rótulos, botões ou seletores de país (utilizar ícones vetoriais limpos e códigos ISO monoespaçados como `BR`, `PT`, `AR`).
2. **Sem `Inter` e sem fontes serifadas:** Proibido usar `Inter`, `Times New Roman`, `Georgia`, `Garamond` ou qualquer fonte serifada em telas da aplicação.
3. **Sem Preto Puro (`#000000`) e sem Roxo/Neon IA:** Proibido usar fundos ou textos `#000000`, brilhos neon externos (*box-shadow glow*) ou gradientes roxo/azul/ciano artificiais.
4. **Sem Saturação Excessiva:** Nenhuma cor de acento acima de 80% de saturação e nunca mais de 1 acento primário de marca.
5. **Sem Labels Flutuantes e Sem Spinners Circulares de Página Inteira:** Inputs têm label fixa acima; carregamentos usam *skeleton shimmer* proporcional ao layout.
6. **Sem Grades Genéricas de "3 Cards Iguais":** Evitar fileiras simétricas de 3 cards idênticos em dashboards ou seções de destaque; priorizar grids de 2 colunas ou Bento assimétrico.
7. **Sem Scroll Horizontal no Mobile:** Tabelas e formulários nunca podem estourar a largura da viewport `< 768px`.
8. **Sem Sobreposição Desordenada de Elementos:** Texto nunca flutua solto sobre mapas ou fotografias sem um contêiner **Frosted HUD** ou zona estrutural própria.
9. **Sem Dados Fabricados ou Clichês de Copy de IA:** Proibido inventar métricas artificiais (ex.: `"99.98% UPTIME"`, `"124ms"`, `"SYSTEM // 2026"`), textos de preenchimento ("Role para explorar", setas pulando), nomes genéricos ("John Doe", "Acme") ou termos clichês ("Eleve sua jornada", "Revolucione", "Seamless", "Next-Gen"). Usar dados orgânicos e realistas de ciclismo (ex.: `"48,4 km"`, `"865 m"`, `"Serra do Japi — Loop Norte"`) ou placeholders claros quando necessário.
10. **Sem `height: 100vh`:** Utilizar sempre `min-height: 100dvh` para evitar quebras na barra de endereços em navegadores móveis.

---

## 10. Guia Rápido de Prompting para o Google Stitch

Ao gerar ou editar telas do **Tracker** no Google Stitch usando este arquivo como referência:

- **Atmosfera:** Descreva como *"clean, bright alpine telemetry interface with Swiss cartographic restraint, Zinc neutral surfaces (#FAFAFA, #FFFFFF), hairline borders (#E4E4E7), and a single deep Alpine Pine accent (#1B6B53)"*.
- **Tipografia:** Especifique *"Geist sans-serif for crisp UI headings and body text, paired with JetBrains Mono tabular numerals for all distances, elevation gains, goal progress ratios, and dates"*.
- **Formas e Profundidade:** Use termos físicos consistentes: *"smoothly rounded architectural cards (16px)"*, *"subtly rounded precision inputs and buttons (10px)"*, *"pill-shaped visibility and difficulty badges"*, *"frosted translucent floating map HUD panels with whisper-soft diffused shadows"*.
- **Responsividade:** Sempre gere ou valide variantes de tela para **Desktop (1440px)** e **Mobile (375px)** garantindo colapso para 1 coluna em formulários, transformação de tabelas em cards empilhados no mobile e alvos táteis mínimos de `44px`.
