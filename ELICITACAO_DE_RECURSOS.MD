# Elicitação de Requisitos – Trackker

**Versão:** 1.1  
**Data:** 15 de abril de 2026  
**Projeto:** Trackker – Aplicativo web para registro e compartilhamento de rotas de atividades

## 1. Introdução e Visão do Produto

O **Trackker** é um aplicativo web destinado a atletas amadores que desejam registrar, visualizar, editar e compartilhar rotas de pedal, caminhada e corrida. O sistema oferece mapas responsivos, cálculos automáticos de distância e altimetria, visibilidade pública/privada e exportação de rotas.

**Tecnologias principais:** Angular + Spring Boot + PostgreSQL + PostGIS  
**MVP:** 16 de abril de 2026  
**Entrega Final:** Final de maio de 2026

## 2. Stakeholders e Perfis de Usuários

- **Usuário Comum (Atleta Amador):** Registra rotas, gerencia seu perfil, explora rotas públicas próximas, adiciona comentários e fotos.
- **Administrador:** Gerencia usuários e realiza manutenção do sistema.

**Autenticação:** JWT

## 3. Requisitos Funcionais (RF)

| ID        | Módulo                        | Descrição do Requisito                                                                 | Prioridade |
|-----------|-------------------------------|----------------------------------------------------------------------------------------|------------|
| RF-01     | Autenticação e Usuários       | Cadastro de novo usuário (nome, e-mail, senha, foto de perfil opcional)                | 1          |
| RF-02     | Autenticação e Usuários       | Login e logout com JWT                                                                 | 1          |
| RF-03     | Autenticação e Usuários       | Visualizar e editar dados do perfil (nome, e-mail, senha, foto)                        | 1          |
| RF-04     | Autenticação e Usuários       | Administrador visualizar lista de todos os usuários                                    | 3          |
| RF-05     | Gerenciamento de Rotas        | Criar nova rota (nome, descrição, tipo de atividade, data, pontos no mapa, visibilidade pública/privada) | 1          |
| RF-06     | Gerenciamento de Rotas        | Armazenar rota utilizando PostGIS (GEOMETRY LineString ou GEOGRAPHY)                   | 1          |
| RF-07     | Gerenciamento de Rotas        | Editar rota própria (nome, descrição, visibilidade, pontos)                            | 1          |
| RF-08     | Gerenciamento de Rotas        | Excluir rota própria                                                                   | 1          |
| RF-09     | Gerenciamento de Rotas        | Adicionar comentários e fotos às próprias rotas                                        | 2          |
| RF-10     | Gerenciamento de Rotas        | Calcular automaticamente distância total (km) e elevação acumulada                    | 1          |
| RF-11     | Exploração e Visualização     | Visualizar todas as rotas do próprio usuário (lista + mapa)                            | 1          |
| RF-12     | Exploração e Visualização     | Visualizar rotas públicas de outros usuários                                           | 1          |
| RF-13     | Exploração e Visualização     | Buscar rotas públicas por localidade (raio de distância a partir de coordenada)        | 1          |
| RF-14     | Exploração e Visualização     | Visualizar detalhes de uma rota (mapa responsivo, distância, altimetria/gráfico, descrição, comentários, fotos) | 1          |
| RF-15     | Exploração e Visualização     | Mapas totalmente responsivos (desktop e tablet)                                        | 1          |
| RF-16     | Exportação                    | Exportar rota no formato .GPX                                                          | 2          |
| RF-17     | Comentários e Mídia           | Adicionar comentários em rotas públicas                                                | 2          |
| RF-18     | Comentários e Mídia           | Fazer upload de até 5 fotos por rota                                                   | 2          |
| RF-19     | Perfil do Usuário             | Perfil exibir histórico de rotas e estatísticas básicas (total km, número de rotas)    | 2          |
| RF-20     | Administração                 | Administrador desativar/excluir contas de usuários                                     | 3          |

**Legenda de Prioridade:**  
asssssssssssssssssssssssssssssssss

## 4. Requisitos Não Funcionais (RNF)

| ID        | Categoria              | Descrição do Requisito                                                                 | Prioridade |
|-----------|------------------------|----------------------------------------------------------------------------------------|------------|
| RNF-01    | Desempenho             | Carregamento de mapas e rotas em menos de 2 segundos                                   | 1          |
| RNF-02    | Desempenho             | Busca por rotas próximas retornar em menos de 1 segundo (com índice espacial)          | 1          |
| RNF-03    | Usabilidade            | Interface intuitiva e com uso fluído (mobile-first)                                    | 1          |
| RNF-04    | Usabilidade            | Mapas responsivos em resoluções de 320px até 4K                                        | 1          |
| RNF-05    | Segurança              | Autenticação JWT segura com proteção contra ataques comuns                             | 1          |
| RNF-06    | Segurança              | Respeitar visibilidade das rotas (privada só para o dono)                              | 1          |
| RNF-07    | Segurança              | Validação de uploads de fotos (tipo e tamanho máximo 5 MB)                             | 1          |
| RNF-08    | Manutenibilidade       | Código bem estruturado e documentado (endpoints e classes)                             | 1          |
| RNF-09    | Escalabilidade         | Suportar até 1.000 rotas por usuário e 10.000 usuários ativos (meta inicial)           | 2          |
| RNF-10    | Integridade de Dados   | Cálculos de distância e altimetria feitos automaticamente no backend (PostGIS)         | 1          |
| RNF-11    | Compatibilidade        | Funcionar corretamente nos navegadores Chrome, Firefox e Edge (versões recentes)       | 1          |
| RNF-12    | Acessibilidade         | Atender WCAG 2.1 nível AA (contraste e navegação por teclado)                          | 3          |

**Legenda de Prioridade:**  
1 = 1 (obrigatório no MVP)  
2 = 2 (importante – entregar até final de maio)  
3 = 2 (desejável – pode ficar para versões futuras)

---

