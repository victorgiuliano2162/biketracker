# Trakker

# Trakker

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?logo=spring)
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

<!-- Sugestão: liste aqui as variáveis necessárias, por exemplo: -->

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_USER` | Usuário do banco de dados | `trakker` |
| `POSTGRES_PASSWORD` | Senha do banco de dados | `********` |
| `MINIO_ROOT_USER` | Usuário do Minio | `trakker` |
| `MINIO_ROOT_PASSWORD` | Senha do Minio | `********` |
| `JWT_SECRET` | Segredo usado na geração de tokens OAuth2 | `********` |

# Principais EndPoints

Cada endpoint desses também presume rotas filhas para tratar de atividade especificas.

### Backend
Caso seja necessário realizar verificações no endpoints do backend todas as chamadas para  são iniciadas pelo préfixo ```api```, sem necessidade de explicitar a porta.

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| post | `/api/user` | Não | Criação de usuários |
| post | `/api/auth/login` | Não | Login |
| post | `/api/auth/refresh` | Não | Refresh de token |
| post | `/api/auth/forgot-password` | Não | Solicitação de recuperação de senha |
| post | `/api/auth/reset-password` | Não | Redefinição de senha |
| get | `/api/health/**` | Não | Verificação de integridade da API |
| get | `/api/routes/public/**` | Não | Rotas públicas |
| get | `/api/routes/public/search/**` | Não | Busca de rotas públicas |
| post | `/api/routes` | Sim | Gerenciamento de rotas do usuário |
| get | `/api/activities/{activityId}/images` | Sim | Imagens referentes a cada atividade |




### Frontend

Aqui ignora-se prefixo. O naming para cada endpoint é simples e elucida sua função, contudo somente os 4 primeiros não exigem um usuário autenticado.

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
