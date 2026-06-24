# TCC - Sistema de Agendamentos de Massagem

## Descrição
Projeto de agenda de massagens com frontend web, API Node.js/Express e banco MySQL em Docker.

## Requisitos
- Docker Desktop instalado
- Navegador web
- Terminal/PowerShell

## Como executar
```bash
cd TCC
docker compose up -d --build
docker compose ps
```

## URLs de acesso
- http://localhost:8080/
- http://localhost:8080/agendamentos.html

## Comandos úteis
```bash
docker compose ps
docker compose logs -f backend
docker compose restart
docker compose down
docker compose down -v
```

## Arquitetura
- `backend/`: API Node.js com healthcheck
- `frontend/`: site servido por Nginx
- `database/`: scripts de inicialização MySQL
- `docker-compose.yml`: orquestração de `db`, `backend` e `frontend`

## Endpoints principais
- `GET /api/clientes`
- `POST /api/clientes`
- `GET /api/agendamentos`
- `POST /api/agendamentos`
- `GET /health`

## Scripts de apoio
- `iniciar-apresentacao.bat`
- `iniciar-apresentacao.ps1`
- `verificar-sistema.bat`

## Limpeza do ambiente
```bash
docker compose down
docker compose down -v
```
- Arquivo de exemplo de variáveis seguras: `.env.example`

#### 10. **Possíveis Demonstrações Avançadas**
- **Teste de Stress**: Criar múltiplos agendamentos
- **Validação**: Tentar criar dados inválidos
- **Busca**: Demonstrar filtros de busca
- **Responsividade**: Testar em diferentes tamanhos de tela

#### 10. **Troubleshooting**
```bash
# Se containers não sobem
docker compose down -v
docker compose up -d --build

# Se API não responde
docker compose logs backend
docker compose restart backend

# Se banco não conecta
docker compose logs db
docker compose restart db
```

## 🎉 Apresentação Concluída!

O sistema demonstra:
- ✅ Arquitetura completa (Frontend + Backend + BD)
- ✅ CRUD completo para clientes e agendamentos
- ✅ Interface moderna e responsiva
- ✅ Validações e segurança
- ✅ Containerização com Docker
- ✅ API RESTful bem estruturada

---

## Backend Completo

### 🚀 Rodar com Docker (Recomendado)
```bash
cd TCC
cp .env.example .env
docker compose up -d --build
```
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check API**: http://localhost:3000/health
- **MySQL**: localhost:3307 | root (via .env) | DB: agenda_massagem
- **Logs**: `docker compose logs -f backend`

### Estrutura
```
TCC/
├── backend/          # Node.js/Express API
│   ├── server.js     # API completa (CRUD clientes/agendamentos/servicos)
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── database/         # schema.sql (auto-init)
├── frontend/         # HTML/JS/CSS (agora usa API real)
└── docker-compose.yml
```

### API Endpoints
- `GET /api/clientes` - Lista clientes
- `POST /api/clientes` - Criar cliente
- `GET/POST/PUT/DELETE /api/agendamentos/:id` - Agendamentos c/ new client inline
- `GET /api/servicos` - Tipos de massagem

**Features**: Validations, joins, transactions, connection pool, CORS, health checks.

### Desenvolvimento Local (sem Docker)
```bash
cd backend
npm install
# Crie DB local + rode database/schema.sql
npm start
```

## Próximos passos (Frontend)
- Migrar localStorage para /api/clientes no clientes.js
- UI melhorias

=======
# TCC-

