# Trakker

Trakker nasce como um aplicativo web destinado a atletas amadores que desejam compartilhar suas experiências em trilhas/trajetos, abrindo caminho para que a comunidade possa descobrir novos lugares. O sistema oferece mapas responsivos, cálculos automáticos de distância e altimetria, e visibilidade pública/privada das rotas.

O uso do usuário se dá majoritariamente através da interação com arquivos `.gpx`, imagens e comentários a respeito da rota.

<!-- Sugestão: adicione aqui um screenshot ou GIF do mapa/app em funcionamento -->

---

## Funcionalidades

- Upload e processamento de arquivos `.gpx`
- Cálculo automático de distância e altimetria das rotas
- Mapas interativos e responsivos
- Upload de imagens vinculadas a atividades, com verificação automática via TensorFlow.js
- Controle de visibilidade pública/privada das rotas
- Busca de rotas públicas

---

## Estrutura da aplicação

A estrutura geral pode ser dividida em: Docker, Nginx, Angular, Java/Spring, Postgres e Minio.

### Docker Compose

Imagens:
- postgis/postgis:16-3.4
- nginx:alpine
- node:20-alpine
- eclipse-temurin:17-jdk-alpine
- tobi312/minio:alpine

### Nginx

O funcionamento da aplicação é orquestrado pelo Nginx, responsável por gerenciar proxy reverso, encaminhar chamadas e gerir certificados SSL para HTTPS.

### Angular

Foi escolhido como framework para o frontend. Utilizamos a versão 19, junto a algumas dependências cruciais para o desenvolvimento do projeto:

Para componentização:
- Angular Material

Exibição e processamento de dados geográficos:
- Leaflet
- Leaflet-image

Exibição de gráficos:
- Chart.js
- Ngx-charts

Verificação de imagens enviadas pelo usuário:
- TensorFlow.js

### Java/Spring

Foi escolhida a versão 17 do Java junto à versão 4.0.3 do Spring Boot.

Família Spring:
- JPA
- Security
- Test
- OAuth2 Resource Server
- Validation
- WebMvc
- Security Test
- Mail
- Actuator
- Testcontainers
- DevTools
- Security Crypto

Autenticação:
- OAuth2

Testes:
- JUnit
- Testcontainers

Utilitários:
- Lombok

Processamento de dados geográficos:
- Locationtech.jts

Cliente HTTP:
- OkHttp3

Banco de dados:
- Postgres
- Minio

### Postgres

Foi utilizada a versão 16 do Postgres por meio de uma imagem personalizada fornecida pela equipe do *PostGIS*, para facilitar o armazenamento dos dados geográficos.

### Minio

Foi utilizado como repositório para as fotos e miniaturas geradas pela aplicação.

---

## Requisitos para execução

Para a execução do programa, é necessário:
- Máquina com 4GB de RAM e a engine do Docker instalada
- Chaves PEM geradas — há um passo a passo no arquivo [certificados.md](CERTIFICADOS.MD), ou siga o passo a passo para [Linux][1] ou [Windows][2]

Após isso, execute na raiz do projeto:

```bash
docker compose up --build
```

### Variáveis de ambiente

<!-- Sugestão: liste aqui as variáveis necessárias, por exemplo: -->

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_USER` | Usuário do banco de dados | `trakker` |
| `POSTGRES_PASSWORD` | Senha do banco de dados | `********` |
| `MINIO_ROOT_USER` | Usuário do Minio | `trakker` |
| `MINIO_ROOT_PASSWORD` | Senha do Minio | `********` |
| `JWT_SECRET` | Segredo usado na geração de tokens OAuth2 | `********` |

> Preencha a tabela acima com as variáveis reais usadas no `docker-compose.yml` / `.env` do projeto.

### Ambiente de desenvolvimento

<!-- Sugestão: instruções para rodar cada parte isoladamente, por exemplo: -->

**Backend (Spring Boot):**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend (Angular):**
```bash
cd frontend
npm install
ng serve
```

### Testes

Para rodar a suíte de testes do backend (JUnit + Testcontainers):

```bash
./mvnw test
```

---

## Principais endpoints

Cada endpoint abaixo também presume rotas filhas para tratar de atividades específicas.

### Backend

Todas as chamadas ao backend são iniciadas pelo prefixo `api`, sem necessidade de explicitar a porta.

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| — | `/api/user` | Não | Criação de usuários |
| — | `/api/auth/login` | Não | Login |
| — | `/api/auth/refresh` | Não | Refresh de token |
| — | `/api/auth/forgot-password` | Não | Solicitação de recuperação de senha |
| — | `/api/auth/reset-password` | Não | Redefinição de senha |
| — | `/api/health/**` | Não | Verificação de integridade da API |
| — | `/api/routes/public/**` | Não | Rotas públicas |
| — | `/api/routes/public/search/**` | Não | Busca de rotas públicas |
| — | `/api/routes` | Sim | Gerenciamento de rotas do usuário |
| — | `/api/activities/{activityId}/images` | Sim | Imagens referentes a cada atividade |

> Preencha a coluna "Método" (GET/POST/PUT/DELETE) conforme cada rota implementada. Se houver Swagger/OpenAPI disponível, vale linkar aqui em vez de manter a tabela manual.

### Frontend

Aqui ignora-se o prefixo. O naming para cada endpoint é simples e elucida sua função; contudo, somente as 4 primeiras rotas não exigem um usuário autenticado.

| Rota | Autenticação necessária |
|---|---|
| `/login` | Não |
| `/subscribe` | Não |
| `/forgot-password` | Não |
| `/reset-password` | Não |
| `/home` | Sim |
| `/map` | Sim |
| `/routes` | Sim |
| `/status` | Sim |

---

## Como contribuir

<!-- Sugestão: descreva o fluxo de contribuição, por exemplo: -->

1. Faça um fork do repositório
2. Crie uma branch a partir de `main`: `git checkout -b feature/minha-feature`
3. Faça commit das alterações seguindo o padrão de mensagens do projeto
4. Abra um Pull Request descrevendo a mudança

---

## Licença

<!-- Sugestão: defina a licença do projeto, por exemplo MIT, ou indique "uso pessoal/acadêmico" -->

Este projeto ainda não possui uma licença definida.

---

[1]: https://www.ibm.com/docs/en/ts4500-tape-library?topic=certificates-generating-private-key
[2]: https://medium.com/@rajeshkanna_a/ssh-public-key-and-private-key-generation-windows-fdd8f87d4a9