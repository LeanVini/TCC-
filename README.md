=======
# TCC - Sistema de Agendamentos de Massagem

## 🎯 Apresentação do Sistema

### 📋 Pré-requisitos para Apresentação
- Docker Desktop instalado
- VS Code com extensão Live Server (opcional)
- Navegador web
- Terminal/PowerShell

### ⚡ Scripts de Apresentação Automática

Para facilitar a apresentação, foram criados scripts automáticos:

#### **Windows (CMD/Batch)**
```cmd
# Execute dentro da pasta TCC
iniciar-apresentacao.bat
```

#### **Windows (PowerShell)**
```powershell
# Execute dentro da pasta TCC
.\iniciar-apresentacao.ps1

# Opções avançadas:
.\iniciar-apresentacao.ps1 -Clean    # Limpar dados antigos
.\iniciar-apresentacao.ps1 -Force    # Forçar reconstrução
```

**O que os scripts fazem:**
1. ✅ Verificam se Docker está instalado
2. ✅ Confirmam que estão no diretório correto
3. ✅ Iniciam todos os serviços (backend, banco, frontend)
4. ✅ Aguardam inicialização completa
5. ✅ Mostram status dos containers
6. ✅ Exibem URLs de acesso e instruções

### � Verificação Pré-Apresentação

Antes de apresentar, execute a verificação do sistema:

```cmd
# Execute dentro da pasta TCC
verificar-sistema.bat
```

**Esta verificação testa:**
- ✅ Instalação do Docker
- ✅ Arquivos do projeto presentes
- ✅ Portas disponíveis
- ✅ Conectividade de rede
- ✅ Espaço em disco suficiente

### 📄 Arquivos de Apoio

- **`iniciar-apresentacao.bat`** - Script automático para Windows CMD
- **`iniciar-apresentacao.ps1`** - Script avançado para PowerShell
- **`verificar-sistema.bat`** - Verificação pré-apresentação
- **`config-apresentacao.ini`** - Configurações e dados de exemplo

### �🚀 Passo a Passo para Apresentação

#### 1. **Preparação do Ambiente**
```bash
# Navegar para o diretório do projeto
cd TCC

# Iniciar todos os serviços (Backend + Banco + Frontend)
docker compose up -d --build

# Verificar se tudo está rodando
docker compose ps
```

#### 2. **Verificação dos Serviços**
```bash
# Verificar status dos containers
docker compose ps

# Ver logs se necessário
docker compose logs -f backend
```

#### 3. **Acesso ao Sistema**
- **URL Principal**: Diretório: C:\Users\vinic\Downloads\TCC\TCC-\TCC--main
- **Página Inicial**: http://localhost:3000/index.html
- **Sistema de Agendamentos**: http://localhost:3000/agendamentos.html

#### 4. **Demonstração das Funcionalidades**

##### **A) Gerenciamento de Clientes**
1. Acesse: http://localhost:3000/agendamentos.html
2. Clique na aba "👥 Clientes"
3. **Criar Cliente**:
   - Nome: "João Silva"
   - Telefone: "11987654321"
   - Email: "joao@email.com"
   - Clique "Salvar Cliente"
4. **Editar Cliente**: Clique em "Editar" no cliente criado
5. **Buscar Cliente**: Use a barra de busca por nome/telefone

##### **B) Gerenciamento de Agendamentos**
1. Clique na aba "📅 Agendamentos"
2. **Criar Agendamento**:
   - Data: Selecionar data futura
   - Hora: "14:30"
   - Tipo de Massagem: Selecionar "Massagem Relaxante"
   - Cliente: Selecionar cliente criado
   - Observações: "Primeira sessão"
   - Clique "Salvar Agendamento"
3. **Editar Agendamento**: Clique em "Editar" no agendamento
4. **Excluir Agendamento**: Clique em "Excluir" (confirmar)

##### **C) Visualização da Agenda**
- Todos os agendamentos aparecem na tabela
- Dados incluem: Data, Hora, Tipo, Cliente, Email, Observações
- Ordenação automática por data/hora

#### 5. **Arquitetura Técnica**

##### **Backend (Node.js + Express)**
- API RESTful completa
- Validação com Joi
- Conexão MySQL com pool
- CORS habilitado
- Health checks

##### **Frontend (HTML + CSS + JavaScript)**
- Interface responsiva
- Navegação por abas
- Formulários dinâmicos
- Validação client-side
- Integração com API

##### **Banco de Dados (MySQL)**
- Tabelas: clientes, servicos, agendamentos
- Relacionamentos FK
- Auto-inicialização via Docker

#### 6. **Endpoints da API**
```bash
# Clientes
GET    /api/clientes           # Listar todos
GET    /api/clientes/:id       # Buscar por ID
POST   /api/clientes           # Criar cliente
PUT    /api/clientes/:id       # Atualizar cliente
DELETE /api/clientes/:id       # Remover cliente

# Agendamentos
GET    /api/agendamentos       # Listar todos
GET    /api/agendamentos/:id   # Buscar por ID
POST   /api/agendamentos       # Criar agendamento
PUT    /api/agendamentos/:id   # Atualizar agendamento
DELETE /api/agendamentos/:id   # Remover agendamento

# Serviços
GET    /api/servicos           # Listar tipos de massagem

# Sistema
GET    /health                 # Health check
```

#### 7. **Estrutura de Arquivos**
```
TCC/
├── backend/                   # API Node.js
│   ├── server.js             # Servidor principal
│   ├── package.json          # Dependências
│   ├── Dockerfile            # Containerização
│   └── .env                  # Configurações
├── database/                 # Banco de dados
│   └── schema.sql            # Estrutura inicial
├── frontend/                 # Interface web
│   ├── index.html            # Página inicial
│   ├── agendamentos.html     # Sistema principal
│   ├── css/style.css         # Estilos
│   └── js/                   # Scripts
│       ├── app.js            # Lógica principal
│       └── clientes.js       # Funcionalidades clientes
├── iniciar-apresentacao.bat  # Script de apresentação (CMD)
├── iniciar-apresentacao.ps1  # Script de apresentação (PowerShell)
├── verificar-sistema.bat     # Verificação pré-apresentação
├── config-apresentacao.ini   # Configurações de exemplo
├── docker-compose.yml        # Orquestração
└── README.md                 # Este arquivo
```

#### 8. **Comandos Úteis para Apresentação**
```bash
# Verificar containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Reiniciar serviços
docker compose restart

# Parar tudo
docker compose down

# Limpar volumes (resetar dados)
docker compose down -v
```

#### 9. **Possíveis Demonstrações Avançadas**
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
docker compose up -d --build
```
- **Frontend + API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **MySQL**: localhost:3307 | root/password | DB: agenda_massagem
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

