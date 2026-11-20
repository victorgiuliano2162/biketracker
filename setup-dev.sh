#!/usr/bin/env bash
# ==============================================================================
# Trakker - Script de Configuração de Ambiente de Desenvolvimento
# Gera certificados SSL (Nginx) e chaves RSA (JWT) automaticamente
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==> Iniciando configuração do ambiente local do Trakker...${NC}"

# 1. Verifica dependência do openssl
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}[ERRO] OpenSSL não encontrado! Instale o openssl para continuar.${NC}"
    exit 1
fi

# Diretório raiz do projeto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 2. Geração dos Certificados SSL para o Nginx (HTTPS)
CERTS_DIR="nginx/certs"
mkdir -p "$CERTS_DIR"

if [[ -f "$CERTS_DIR/cert.pem" && -f "$CERTS_DIR/key.pem" ]]; then
    echo -e "${YELLOW}[INFO] Certificados SSL do Nginx já existem em $CERTS_DIR. Ignorando geração.${NC}"
else
    echo -e "${GREEN}[+] Gerando certificado SSL autoassinado para o Nginx (localhost)...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERTS_DIR/key.pem" \
        -out "$CERTS_DIR/cert.pem" \
        -subj "/CN=localhost" \
        2>/dev/null
    chmod 600 "$CERTS_DIR/key.pem"
    echo -e "${GREEN}[OK] Certificados do Nginx gerados com sucesso.${NC}"
fi

# 3. Geração das Chaves RSA para JWT (OAuth2 Resource Server)
if [[ -f "private.pem" && -f "public.pem" ]]; then
    echo -e "${YELLOW}[INFO] Chaves RSA (private.pem / public.pem) já existem na raiz. Ignorando geração.${NC}"
else
    echo -e "${GREEN}[+] Gerando par de chaves RSA 2048 bits para assinatura de JWT...${NC}"
    openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048 2>/dev/null
    openssl rsa -pubout -in private.pem -out public.pem 2>/dev/null
    chmod 600 private.pem
    echo -e "${GREEN}[OK] Chaves RSA geradas com sucesso (private.pem, public.pem).${NC}"
fi

# 4. Criação do arquivo .env a partir do .env.example
if [[ -f ".env" ]]; then
    echo -e "${YELLOW}[INFO] Arquivo .env já existe. Nenhuma alteração foi feita no .env existente.${NC}"
else
    echo -e "${GREEN}[+] Criando arquivo .env a partir do .env.example com as chaves geradas...${NC}"
    
    if [[ ! -f ".env.example" ]]; then
        echo -e "${RED}[ERRO] Arquivo .env.example não encontrado!${NC}"
        exit 1
    fi

    # Converte as chaves PEM em string de linha única com \n literal
    PRIV_KEY_ESCAPED=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0}' private.pem | sed 's/\\n$//')
    PUB_KEY_ESCAPED=$(awk 'NF {sub(/\r/, ""); printf "%s\\n",$0}' public.pem | sed 's/\\n$//')

    cp .env.example .env

    # Substitui os placeholders pelas chaves geradas no .env
    # Usando delimitador | no sed para não conflitar com caracteres do PEM
    sed -i "s|JWT_PRIVATE_KEY=.*|JWT_PRIVATE_KEY=\"$PRIV_KEY_ESCAPED\"|" .env
    sed -i "s|JWT_PUBLIC_KEY=.*|JWT_PUBLIC_KEY=\"$PUB_KEY_ESCAPED\"|" .env
    chmod 600 .env

    echo -e "${GREEN}[OK] Arquivo .env criado e populado com sucesso.${NC}"
fi

echo -e "\n${GREEN}✔ Configuração concluída!${NC}"
echo -e "${BLUE}Você já pode rodar: ${GREEN}docker compose up --build${NC}\n"
