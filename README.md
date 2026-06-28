# Trakker

Trakker é nasce como um aplicativo web destinado a atletas amadores que desejam compartilhar suas experiências em trilhas/trajetos abrindo o caminho para que a comunidade possa descobrir novos lugares. O sistema oferece mapas responsivos, cálculos automáticos de distância e altimetria, visibilidade pública/privada.

O uso do usuário se dá majoritariamente através da interação com arquivos .gpx, imagens e comentários a respeito da rota.

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
- máquina com 4gb de ram e a engine do docker instalada
- será necessário que as chaves pem sejam geradas, há um passo a passo no arquivo [certificados.md](CERTIFICADOS.MD), ou seguir o passo a passo no [Linux][1] ou [Windows][2]


Após isso será necessário executar um ```docker compose up --build``` na raiz do projeto.

# Principais EndPoints

Cada endpoint desses também presume rotas filhas para tratar de atividade especificas.

### Backend
Caso seja necessário realizar verificações no endpoints do backend todas as chamadas para  são iniciadas pelo préfixo ```api```, sem necessidade de explicitar a porta.

- ```/api/user``` para criação de usuários
- ```/api/health``` verificar integridade da api
- ```/api/auth``` autenticação
- ```/api/activities/{activityId}/images``` imagens referentes a cada atividade
- ```/api/routes``` rotas

No backend estás rotas estão expostas:

- ```/api/user```
- ```/api/user```
- ```/api/auth/login```
- ```/api/auth/refresh```
- ```/api/routes/public/**```
- ```/api/routes/public/search/**```
- ```/api/health/**```
- ```/api/auth/forgot-password```
- ```/api/auth/reset-password```


### Frontend

Aqui ignora-se prefixo. O naming para cada endpoint é simples e elucida sua função, contudo somente os 4 primeiros não exigem um usuário autenticado.

- ```/login```
- ```/subscribe ```
- ```/forgot-password ```
- ```/reset-password```
- ```/home```
- ```/map```
- ```/routes```
- ```/status```







[1]: https://www.ibm.com/docs/en/ts4500-tape-library?topic=certificates-generating-private-key
[2]: https://medium.com/@rajeshkanna_a/ssh-public-key-and-private-key-generation-windows-fdd8f87d4a9
