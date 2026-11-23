# Trakker

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.3-brightgreen?logo=spring)
![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)
![Docker](https://img.shields.io/badge/Docker-Container-blue?logo=docker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Trakker nasce como um aplicativo web destinado a atletas amadores que desejam compartilhar suas experiências em trilhas/trajetos abrindo o caminho para que a comunidade possa descobrir novos lugares. O sistema oferece mapas responsivos, cálculos automáticos de distância e altimetria, visibilidade pública/privada.

O uso do usuário se dá majoritariamente através da interação com arquivos `.gpx`, imagens e comentários a respeito da rota.

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
A estrutura geral pode ser dividade em: Docker, Nginx, Angular, Java/Spring, Postgres e Minio.

### Docker Compose

Imagens:
- postgis/postgis:16-3.4
- nginx:alpine
- node:20-alpine
- eclipse-temurin:17-jdk-alpine
- tobi312/minio:alpine

### Nginx
A funcionamento da aplicação é orquestrado pelo nginx, responsável por gerenciar proxy reverso, encaminha chamadas, gerir certificaldos SSL para HTTPS.

### Angular
Foi escolhido como framwork para o frontend, aqui o utilizamos na versão 19 junto a algumas dependências cruciais para o desenvolvimento do projeto:

Para componentização:
- Angular Material

Exibição e processamento de dados geográficos:
- Leaflet
- Leaflet-image

Exibição de gráficos:
- Chart.js
- Ngx-charts

Varificação de imagens upadas pelo usuário:
- Tensorflow.js


### Java/Spring
Foi escolhida a verão 17 do Java junto a versão 4.0.3 do Springboot

Família spring:
- JPA
- Security
- Test
- Oauth2 resource server
- Validation
- WebMvc
- Security test
- Mail
- Actuator
- Testcontainers
- DevTools
- Security Crypto

Autenticação: 
- Oauth2

Testes: 
- JUnit
- Ttestcontainers

Utilitários:
- Lombok

Processamento de dados geográficos:
- Locationtech.jts

Cliente HTTP:
- Okhttp3

Banco de dados:
- Postgres
- Minio

### Postgres
Foi utilizada a versão 16 do postgres por meio de uma imagem personalizada fornecida pela equipe do *PostGis* para facilitar o armazenamento dos dados geográficos.

### Minio
Foi utlizado como repositório para as fotos e miniaturas geradas pela aplicação.


# Requisitos para execução:
Para a execução do programa se faz necessário:
- Máquina com 4gb de ram e a engine do docker instalada
- Chaves PEM, há um passo a passo no arquivo [certificados.md](CERTIFICADOS.MD), ou seguir o passo a passo no [Linux][1] ou [Windows][2]


Após isso, execute na raiz do projeto:

```bash
docker compose up --build
```

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores necessários:

| Variável | Descrição | Exemplo |
|---|---|---|
| `JWT_PRIVATE_KEY` | Chave privada RSA (PEM) para assinatura de tokens JWT | `-----BEGIN PRIVATE KEY-----...` |
| `JWT_PUBLIC_KEY` | Chave pública RSA (PEM) para validação de tokens JWT | `-----BEGIN PUBLIC KEY-----...` |
| `MAIL_USERNAME` | Usuário SMTP para envio de e-mails de recuperação de senha | `seu_email@provedor.com` |
| `MAIL_PASSWORD` | Senha ou app password SMTP | `********` |
| `MINIO_ACCESS_KEY` | Chave de acesso ao MinIO S3 | `minioadmin` |
| `MINIO_SECRET_KEY` | Segredo de acesso ao MinIO S3 | `********` |

# Principais EndPoints

Cada endpoint desses também presume rotas filhas para tratar de atividade especificas.

### Backend
Caso seja necessário realizar verificações nos endpoints do backend, todas as chamadas são iniciadas pelo prefixo `/api`, sem necessidade de explicitar a porta.

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/api/user` | Não | Criação de usuários |
| GET / PUT | `/api/user/me` | Sim | Consulta e edição do perfil do atleta autenticado |
| POST | `/api/auth/login` | Não | Login (emite access + refresh token) |
| POST | `/api/auth/refresh` | Não | Rotação e renovação de tokens |
| POST | `/api/auth/logout` | Não | Revogação do refresh token |
| POST | `/api/auth/forgot-password` | Não | Solicitação de recuperação de senha |
| POST | `/api/auth/reset-password` | Não | Redefinição de senha |
| GET | `/api/health/**` | Não | Verificação de integridade da API |
| GET | `/api/routes/public/**` | Não | Listagem, busca espacial e preview de rotas públicas |
| POST / GET / PATCH / DELETE | `/api/routes/**` | Sim | Criação, listagem, detalhes, replay, visibilidade e exclusão de rotas |
| GET / POST / PUT / DELETE | `/api/goal/**` | Sim | Gestão de metas esportivas com cálculo automático de progresso |
| GET | `/api/home/stats` | Sim | Estatísticas agregadas e metas ativas do dashboard |
| GET / POST | `/api/activities/{activityId}/images` | Sim | Upload e URLs assinadas das fotos de cada rota |




### Frontend

| Rota | Autenticação necessária |
|---|---|
| `/login` | Não |
| `/subscribe` | Não |
| `/forgot-password` | Não |
| `/reset-password` | Não |
| `/home` | Sim |
| `/map` | Sim |
| `/routes` | Sim |
| `/routes/:id` | Sim |
| `/goals` | Sim |
| `/goal` | Sim |
| `/status` | Sim |
| `/profile` | Sim |

## Como contribuir

<!-- Sugestão: descreva o fluxo de contribuição, por exemplo: -->

1. Faça um fork do repositório
2. Crie uma branch a partir de `main`: `git checkout -b feature/minha-feature`
3. Faça commit das alterações seguindo o padrão de mensagens do projeto
4. Abra um Pull Request descrevendo a mudança

---

## Licença
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)







[1]: https://www.ibm.com/docs/en/ts4500-tape-library?topic=certificates-generating-private-key
[2]: https://medium.com/@rajeshkanna_a/ssh-public-key-and-private-key-generation-windows-fdd8f87d4a9
