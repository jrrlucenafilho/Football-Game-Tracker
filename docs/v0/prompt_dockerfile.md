User: make a dockerfile for this application

Agent: 
Arquivos criados:

| Arquivo | Função |
|---|---|
| `docker-compose.yml` | Orquestra PostgreSQL + backend + frontend |
| `backend/Dockerfile` | Build multi-stage do backend Express (TypeScript → `dist/`) |
| `frontend/Dockerfile` | Build multi-stage do frontend React, servido via nginx |
| `frontend/nginx.conf` | Proxy reverso: `/api/` → `backend:3001` |
| `.dockerignore` | Exclui `node_modules`, `.git`, `.env`, `dist` do contexto |

**Para executar:**
```bash
docker compose up --build
```

O backend roda migrations automaticamente na inicialização (`prisma migrate deploy`). O frontend fica acessível em `http://localhost` (porta 80) e redireciona chamadas `/api/*` para o backend na porta `3001`.
