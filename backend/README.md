# Football Game Tracker — Backend

API REST para gerenciamento de campeonatos de futebol. Controle de times, partidas e classificação automática.

**Stack:** TypeScript, Express 4, Prisma ORM (PostgreSQL), JWT, Vitest

---

## Sumário

- [Arquitetura](#arquitetura)
- [Modelos de Dados](#modelos-de-dados)
- [API Endpoints](#api-endpoints)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [O que mudar quando necessário](#o-que-mudar-quando-necessário)
- [Testes](#testes)

---

## Arquitetura

```
src/
├── index.ts                     # Entry point: Express app + Swagger + seed admin
├── swagger.ts                   # Especificação OpenAPI (Swagger)
├── lib/
│   └── prisma.ts                # Singleton PrismaClient
├── middleware/
│   └── auth.ts                  # JWT authenticate + requireAdmin
├── routes/
│   ├── auth.ts                  # /api/auth (register, login)
│   ├── times.ts                 # /api/times (CRUD)
│   ├── jogos.ts                 # /api/jogos (CRUD)
│   ├── classificacao.ts         # /api/classificacao
│   └── usuarios.ts              # /api/usuarios (admin)
└── services/
    └── classificacao.ts         # Lógica de pontuação e classificação
```

### Fluxo de requisição

```
Cliente → Express → Middleware CORS/JSON → Rota → Auth (se necessário) → Controller → Prisma → PostgreSQL
```

---

## Modelos de Dados

### Usuario (`usuarios`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int (PK) | Auto incremento |
| nome | String(100) | Nome do usuário |
| email | String(100) (único) | Email para login |
| senha | String(255) | Hash bcrypt |
| nivel_acesso | ENUM(ADMIN, COMUM) | Nível de permissão |
| createdAt | DateTime | Criado em |
| updatedAt | DateTime | Atualizado em |

### Time (`times`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int (PK) | Auto incremento |
| nome | String(100) | Nome do time |
| cidade | String(100)? | Cidade |
| tecnico | String(100)? | Nome do técnico |

### Jogo (`jogos`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int (PK) | Auto incremento |
| data_hora | DateTime? | Data da partida |
| time_casa_id | Int (FK → times) | Time mandante |
| time_visitante_id | Int (FK → times) | Time visitante |
| gols_casa | Int (default 0) | Gols do mandante |
| gols_visitante | Int (default 0) | Gols do visitante |
| estadio | String(100)? | Estádio |

---

## API Endpoints

### Documentação Interativa (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3001/api-docs
```

Lá você pode testar todos os endpoints, ver schemas e exemplos.

### Resumo

#### Públicos (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/times` | Listar times |
| GET | `/api/times/:id` | Buscar time por ID |
| GET | `/api/jogos` | Listar jogos |
| GET | `/api/jogos/:id` | Buscar jogo por ID |
| GET | `/api/classificacao` | Tabela de classificação |

#### Administrativos (requerem JWT + ADMIN)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/times` | Criar time |
| PUT | `/api/times/:id` | Atualizar time |
| DELETE | `/api/times/:id` | Excluir time |
| POST | `/api/jogos` | Criar jogo |
| PUT | `/api/jogos/:id` | Atualizar jogo |
| DELETE | `/api/jogos/:id` | Excluir jogo |
| GET | `/api/usuarios` | Listar usuários |
| GET | `/api/usuarios/:id` | Buscar usuário |
| POST | `/api/usuarios` | Criar usuário |
| PUT | `/api/usuarios/:id` | Atualizar usuário |
| DELETE | `/api/usuarios/:id` | Excluir usuário |

---

## Guia de Desenvolvimento

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente

### Setup inicial

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 3. Rodar migrations
npx prisma migrate dev --name init

# 4. Gerar cliente Prisma
npx prisma generate

# 5. Iniciar servidor (desenvolvimento com hot-reload)
npm run dev
```

O servidor inicia na porta 3001. Na primeira execução, um admin padrão é criado automaticamente:

- **Email:** admin@admin.com
- **Senha:** admin123

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor dev com hot-reload (tsx watch) |
| `npm run build` | Compilar TypeScript para dist/ |
| `npm start` | Rodar build de produção |
| `npm test` | Executar testes (Vitest) |
| `npm run prisma:generate` | Gerar Prisma Client |
| `npm run prisma:migrate` | Rodar migrations |

### Fluxo de trabalho

1. **Criar/Alterar modelo no banco** → Editar `prisma/schema.prisma` → Rodar `npx prisma migrate dev --name descricao`
2. **Criar nova rota** → Criar arquivo em `src/routes/` → Adicionar em `src/index.ts` → Documentar em `src/swagger.ts`
3. **Adicionar lógica de negócio** → Criar arquivo em `src/services/` → Importar na rota
4. **Rodar testes** → `npm test` (unitários + integração)

---

## O que mudar quando necessário

### 1. Alterar regras de pontuação

Edite `src/services/classificacao.ts:16` — função `calcularPontos()`.

Exemplo — mudar vitória para 2 pontos:

```typescript
export function calcularPontos(golsCasa: number, golsVisitante: number) {
  if (golsCasa > golsVisitante) return { pontosCasa: 2, pontosVisitante: 0 };
  // ...
}
```

### 2. Adicionar novo campo a um modelo

1. Edite `prisma/schema.prisma` e adicione o campo
2. Rode `npx prisma migrate dev --name add_campo_x`
3. Atualize a rota relevante em `src/routes/` para incluir o novo campo no `data` do Prisma e no `select`
4. Atualize o schema no Swagger em `src/swagger.ts` (componente `schemas`)

### 3. Adicionar novo endpoint

1. Crie o arquivo em `src/routes/` seguindo o padrão existente
2. Importe e monte em `src/index.ts` com `app.use('/api/recurso', router)`
3. Documente no Swagger em `src/swagger.ts` (adicione o path e schemas se necessário)
4. Adicione testes em `tests/`

### 4. Alterar middleware de autenticação

Edite `src/middleware/auth.ts`:
- Para alterar o tempo de expiração do token, mude `expiresIn` em `src/routes/auth.ts`
- Para alterar a lógica de permissões, edite `requireAdmin()`
- Para adicionar novos níveis de acesso, atualize o enum no Prisma e a interface `AuthPayload`

### 5. Configurar para produção

- Altere `JWT_SECRET` no `.env` para uma chave forte e secreta
- Altere `ADMIN_PASSWORD` no `.env`
- Use um banco PostgreSQL gerenciado (RDS, Supabase, etc.)
- Construa a imagem Docker com `docker build` ou use diretamente `npm run build && npm start`

### 6. Publicar via Docker

```bash
docker build -t football-tracker-backend .
docker run -p 3001:3001 --env-file .env football-tracker-backend
```

### 7. Documentar novo endpoint no Swagger

Edite `src/swagger.ts` e adicione no objeto `paths` seguindo o formato existente. Use `$ref` para reutilizar schemas definidos em `components.schemas`.

---

## Testes

```bash
npm test
```

### Unitários (`tests/calcularPontos.test.ts`)
Testam a função `calcularPontos()` com 6 cenários:
- Vitória em casa, vitória visitante, empate, empate 0-0, goleada, validação de valores

### Integração (`tests/integracao.test.ts`)
32 testes que cobrem todas as rotas:
- Autenticação (registro, login, validações)
- Times CRUD (listar, buscar, criar, atualizar, excluir)
- Jogos CRUD (criar com validação time≠time, listar, atualizar, excluir)
- Classificação (tabela vazia, com dados)
- Usuários CRUD (admin: criar, listar, atualizar, excluir)

> Nota: Testes de integração dependem de um banco PostgreSQL configurado via `DATABASE_URL`.
