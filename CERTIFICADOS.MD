# Configuração do ambiente

## Estrutura esperada de pastas

```
projeto/
├── app/                  ← backend Spring Boot (já existente)
├── app-front/            ← frontend Angular
│   └── Dockerfile        ← copie o Dockerfile.front para cá com esse nome
├── nginx/
│   ├── nginx.conf        ← configuração do Nginx
│   └── certs/
│       ├── cert.pem      ← certificado SSL
│       └── key.pem       ← chave privada SSL
└── docker-compose.yml
```

---

## Gerando certificados autoassinados (desenvolvimento)

Execute na raiz do projeto:

```bash
mkdir -p nginx/certs

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/key.pem \
  -out nginx/certs/cert.pem \
  -subj "/CN=localhost"
```

> O navegador vai exibir um aviso de segurança por ser autoassinado — basta aceitar para desenvolvimento local.

---

## Certificado real com Let's Encrypt (produção)

Para produção com domínio real, use o Certbot:

```bash
apt install certbot
certbot certonly --standalone -d seudominio.com

# Os certificados serão gerados em:
# /etc/letsencrypt/live/seudominio.com/fullchain.pem  → cert.pem
# /etc/letsencrypt/live/seudominio.com/privkey.pem    → key.pem
```

Atualize o `nginx.conf` com `server_name seudominio.com;` e aponte os volumes para os caminhos do Certbot.

---

## Subindo o ambiente

```bash
docker compose up --build
```

Acesse: **https://localhost**

---

## Como as requisições são roteadas

```
https://localhost/          → Angular (front)
https://localhost/api/      → Spring Boot (app:8080)
http://localhost/           → redireciona automaticamente para HTTPS
```
