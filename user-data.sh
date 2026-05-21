#!/bin/bash
set -eux

# Exemplo de User Data para instância Linux (EC2/Cloud)
# Este script instala Docker e Docker Compose e inicia a stack.

if command -v yum >/dev/null 2>&1; then
  yum update -y
  yum install -y docker
  amazon-linux-extras enable docker
  yum install -y docker
elif command -v apt-get >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y docker.io curl
else
  echo "Gerenciador de pacotes não suportado. Ajuste o script conforme a distribuição."
  exit 1
fi

systemctl enable docker
systemctl start docker

DOCKER_COMPOSE_BIN=/usr/local/bin/docker-compose
if [ ! -f "$DOCKER_COMPOSE_BIN" ]; then
  curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o "$DOCKER_COMPOSE_BIN"
  chmod +x "$DOCKER_COMPOSE_BIN"
fi

cd /home/ec2-user/TCC || cd /root/TCC || cd /tmp/TCC || true

# Use um arquivo .env local para variáveis de ambiente
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

docker compose up -d --build
