# TCC Agenda Massagem

Projeto de agendamento com frontend + backend + Docker.

## Estrutura

- `backend/` - Express API com MySQL (mysql2 + Joi + cors)
- `frontend/` - HTML/CSS/JS (páginas de clientes + agendamentos + index)
- `database/schema.sql` - definição de tabelas e seed de serviços
- `docker-compose.yml` no `TCC--main/` - DB + backend

## Preparação local

1. Clone:
   ```bash
   git clone <repo-url>
   cd TCC--main
   ```
2. Garanta `.gitignore`:
   ```gitignore
   node_modules/
   **/node_modules/
   package-lock.json
   backend/package-lock.json
   ```
3. Subir via Docker (recomendado):
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```
4. Verificar containers:
   ```bash
   docker compose ps
   docker compose logs backend --tail 30
   docker compose logs db --tail 30
   ```

## Endpoints API

- `GET /health` - test de conexão e DB
- `GET /api/clientes` - lista clientes
- `POST /api/clientes` - cria cliente JSON
- `GET /api/servicos` - lista serviços
- `GET /api/agendamentos` - lista agendamentos
- `POST /api/agendamentos` - cria agendamento JSON
- `PUT /api/agendamentos/:id` - atualiza
- `DELETE /api/agendamentos/:id` - exclui

## Testes rápidos com curl

```bash
curl -s http://localhost:3000/health | jq
curl -s http://localhost:3000/api/clientes | jq
curl -s http://localhost:3000/api/servicos | jq
curl -s http://localhost:3000/api/agendamentos | jq

curl -s -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana","telefone":"11999998888","email":"ana@teste.com","observacoes":"Cliente novo"}' | jq

curl -s -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{"servico_id":1,"data":"2026-04-10","hora":"09:30","observacoes":"Chegar 15 min antes"}' | jq
```

## Frontend

- Acesse:
  - `frontend/index.html` (página principal)
  - `frontend/agendamentos.html` (fluxos de clientes + agendamentos)

## Observações

- O backend usa `backend/server.js` e possui validação com Joi.
- Rota de health verifica conexão MySQL.
- Se `docker compose` reportar `unhealthy`, ver logs e rodar `docker-compose down -v` e `up` novamente.

## Git (correção)

- Pelo histórico, `node_modules/` foi commitado acidentalmente. para limpar:
  ```bash
  git rm -r --cached backend/node_modules
  git rm --cached package-lock.json backend/package-lock.json
  git commit -m "Remove node_modules do repositório"
  git push origin main
  ```
