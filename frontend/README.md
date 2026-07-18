# Football Game Tracker — Frontend

Interface React para gerenciamento de campeonatos de futebol. Consome a API REST do backend e fornece dashboards, CRUDs e tabela de classificação.

**Stack:** React 18, TypeScript, Vite 5, react-router-dom 6, Playwright

---

## Sumário

- [Arquitetura](#arquitetura)
- [Componentes](#componentes)
- [Roteamento](#roteamento)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [API Client](#api-client)
- [Estilização](#estilização)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [O que mudar quando necessário](#o-que-mudar-quando-necessário)
- [Testes E2E](#testes-e2e)
- [Produção](#produção)

---

## Arquitetura

```
src/
├── main.tsx                     # Entry point: BrowserRouter + App
├── App.tsx                      # Rotas, NavBar, ProtectedRoute
├── api/
│   └── client.ts                # Cliente HTTP genérico com JWT
├── contexts/
│   └── AuthContext.tsx           # Contexto de autenticação + localStorage
└── components/
    ├── Login.tsx                 # Formulário de login
    ├── Register.tsx              # Formulário de cadastro
    ├── Dashboard.tsx             # Visão geral com stats e últimos jogos
    ├── Times.tsx                 # CRUD de times (admin)
    ├── Jogos.tsx                 # CRUD de jogos (admin)
    ├── Classificacao.tsx         # Tabela pública de classificação
    └── Usuarios.tsx              # CRUD de usuários (admin)
```

### Fluxo de dados

```
Componente → api.client (fetch) → Vite proxy/dev → Backend :3001
                ↕
         localStorage (token, user)
                ↕
         AuthContext (user, isAdmin, loading)
```

---

## Componentes

### App (`src/App.tsx`)
- Define `<Routes>` e `<NavBar>`
- `<NavBar>`: links condicionais por admin, nome do usuário + badge de role, botão Sair
- `<ProtectedRoute>`: guarda rotas por autenticação e role
- Layout global: fundo `#f0f2f5`, container max 1200px

### Login (`src/components/Login.tsx`)
- Formulário de email + senha
- Redireciona para `/` se já logado
- Exibe erros da API em vermelho
- Link para `/register`

### Register (`src/components/Register.tsx`)
- Formulário de nome + email + senha
- Sempre registra como `COMUM`
- Redireciona para `/login` ao concluir
- Link para `/login`

### Dashboard (`src/components/Dashboard.tsx`)
- Stats cards (total de times + jogos)
- Botões de atalho para Times/Jogos (admin)
- Tabela dos últimos 5 jogos

### Times (`src/components/Times.tsx`)
- CRUD completo: listar, criar, editar, excluir
- Formulário com nome (obrigatório), cidade, técnico
- Confirmação antes de excluir
- Tabela com colunas: ID, Nome, Cidade, Técnico, Ações
- Estado vazio: "Nenhum time cadastrado"

### Jogos (`src/components/Jogos.tsx`)
- CRUD completo: listar, criar, editar, excluir
- Formulário em grid 2-colunas com selects de times, gols, estádio, data
- Validação frontend: time casa ≠ time visitante
- Selects filtram dinamicamente o time oposto
- Tabela: Casa, Placar, Visitante, Estádio, Ações

### Classificacao (`src/components/Classificacao.tsx`)
- Página pública (sem auth)
- Tabela com #, Time, P, J, V, E, D, Gols Pró, Gols Contra, Saldo
- Saldo positivo com prefixo `+`
- Ordenada por pontos > saldo > gols pró

### Usuarios (`src/components/Usuarios.tsx`)
- CRUD completo (admin only)
- Formulário com nome, email, senha (opcional na edição), tipo (COMUM/ADMIN)
- Tabela: ID, Nome, Email, Tipo, Ações

---

## Roteamento

| Path | Componente | Auth | Admin | Descrição |
|------|-----------|------|-------|-----------|
| `/login` | Login | ❌ | ❌ | Login |
| `/register` | Register | ❌ | ❌ | Cadastro |
| `/` | Dashboard | ✅ | ❌ | Dashboard |
| `/classificacao` | Classificacao | ❌ | ❌ | Tabela pública |
| `/times` | Times | ✅ | ✅ | CRUD times |
| `/jogos` | Jogos | ✅ | ✅ | CRUD jogos |
| `/usuarios` | Usuarios | ✅ | ✅ | CRUD usuários |

### ProtectedRoute

```typescript
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;                     // Aguardando restore do localStorage
  if (!user) return <Navigate to="/login" />;   // Redireciona se não logado
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return children;
}
```

---

## Fluxo de Autenticação

### Login
1. Usuário submete email + senha
2. `AuthContext.login()` → `api.auth.login()` → `POST /api/auth/login`
3. Backend retorna `{ token, usuario }`
4. Salva no `localStorage` (`token`, `user`) e no estado React
5. Redireciona para `/`

### Restauração de sessão
1. `AuthProvider` monta → `useEffect` lê `localStorage.getItem('user')`
2. Se existir, restaura `user` no estado
3. `loading = false` → `ProtectedRoute` libera

### Logout
1. `AuthContext.logout()` limpa `localStorage` e estado
2. NavBar desaparece (pois `user = null`)
3. Próxima navegação cai no `ProtectedRoute` → redirect `/login`

### Roles
- **ADMIN**: acesso a todas as rotas e links de navegação
- **COMUM**: exibido como "Torcedor", acesso apenas a Dashboard e Classificação

---

## API Client

`src/api/client.ts` é um wrapper genérico em cima do `fetch` nativo:

```typescript
const API_BASE = '/api';  // Relativo — funciona com proxy dev e Nginx prod

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken(); // localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ... };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
```

Módulos expostos: `api.auth`, `api.times`, `api.jogos`, `api.usuarios`, `api.classificacao`.

---

## Estilização

O projeto usa **inline styles** em todos os componentes. Não há CSS modules, styled-components ou frameworks CSS.

### Padrões visuais
- Fundo da página: `#f0f2f5`
- Header/nav: `#1a1a2e`
- Cards/tabelas: fundo `#fff`, `border-radius: 8`, `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- Botão ação primária: `#1a1a2e`
- Botão editar: `#16213e`
- Botão excluir: `#e94560`

---

## Guia de Desenvolvimento

### Pré-requisitos
- Node.js 20+
- Backend rodando na porta 3001

### Setup inicial

```bash
cd frontend
npm install
npm run dev
```

O servidor de desenvolvimento inicia em `http://localhost:5173`. Requisições para `/api/*` são proxyadas para `http://localhost:3001` (configurado em `vite.config.ts`).

### Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor Vite com HMR |
| `npm run build` | Type-check + build produção para `dist/` |
| `npm run preview` | Preview do build de produção |
| `npm run test:e2e` | Testes E2E com Playwright |

---

## O que mudar quando necessário

### 1. Adicionar nova página/rota

1. Crie o componente em `src/components/`
2. Adicione a rota em `App.tsx` dentro de `<Routes>`
3. Se for admin-only, use `<ProtectedRoute adminOnly>`
4. Adicione link na `<NavBar>` (se aplicável)
5. Adicione chamada API em `src/api/client.ts` (se necessário)

### 2. Adicionar novo campo a um formulário

1. Adicione o state correspondente no componente (useState)
2. Adicione o input no JSX
3. Inclua o campo no objeto enviado para a API
4. Se for edição, preencha o campo ao abrir o formulário

### 3. Alterar estilo visual

Todos os estilos são inline. Para mudar a aparência global:
- Cores do tema: edite os valores hex nos componentes (ex: `#1a1a2e`, `#e94560`)
- Para um redesign mais amplo, considere migrar para Tailwind ou CSS Modules

### 4. Alterar comportamento de autenticação

Edite `src/contexts/AuthContext.tsx`:
- Para mudar a forma de persistência (trocar localStorage por cookie/sessionStorage)
- Para alterar o tempo de sessão (atualizar `expiresIn` no backend)
- Para adicionar refresh token, crie o fluxo no `api.client.ts` e no contexto

### 5. Adicionar novo recurso na API

1. Crie o módulo no `api.client.ts` (ex: `api.campeonatos = { list: () => ... }`)
2. Crie o componente em `src/components/`
3. Adicione a rota em `App.tsx`

### 6. Configurar variáveis de ambiente

Edite `.env` (copiado de `.env.example`):

```
VITE_API_URL=http://localhost:3001
```

Depois use no `api.client.ts`: `const API_BASE = import.meta.env.VITE_API_URL || '/api';`

### 7. Publicar via Docker

```bash
docker build -t football-tracker-frontend .
docker run -p 5173:80 football-tracker-frontend
```

O Nginx serve os arquivos estáticos e proxy reversa `/api/` para `http://backend:3001`.

---

## Testes E2E

Testes com Playwright em `e2e/`:

| Arquivo | O que testa |
|---------|-------------|
| `login.spec.ts` | Fluxo de login |
| `register.spec.ts` | Fluxo de cadastro |
| `dashboard.spec.ts` | Dashboard + últimos jogos |
| `times.spec.ts` | CRUD de times |
| `jogos.spec.ts` | CRUD de jogos |
| `classificacao.spec.ts` | Tabela de classificação |
| `usuarios.spec.ts` | CRUD de usuários |

### Executar

```bash
npm run test:e2e
```

O Playwright inicia automaticamente o servidor Vite antes dos testes (`webServer` no config). Requer o backend rodando para testes completos.

---

## Produção

### Build

```bash
npm run build   # Gera dist/
```

### Docker

```bash
docker build -t football-tracker-frontend .
```

A imagem usa **Nginx Alpine** para servir os arquivos estáticos com proxy reversa para o backend. Configuração em `nginx.conf`.

### Proxy reversa (Nginx)

```nginx
location /api/ {
    proxy_pass http://backend:3001/api/;
}
```

Isso permite que o frontend em produção faça requisições para `/api/*` sem CORS, pois o Nginx atua como proxy reversa.
