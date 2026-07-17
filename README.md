# Football-Game-Tracker

**Estrutura:**

```
Atividade 4/
├── backend/
│   ├── prisma/schema.prisma     # Modelos: Usuario, Time, Jogo (ENUM NivelAcesso)
│   ├── src/
│   │   ├── index.ts             # Servidor Express (porta 3001)
│   │   ├── lib/prisma.ts        # Cliente Prisma
│   │   ├── middleware/auth.ts   # JWT + RBAC (authenticate, requireAdmin)
│   │   ├── routes/
│   │   │   ├── auth.ts          # POST /register, POST /login
│   │   │   ├── times.ts         # CRUD times (POST/PUT/DELETE exigem admin)
│   │   │   ├── jogos.ts         # CRUD jogos (validação time ≠ time) 
│   │   │   └── classificacao.ts # GET /classificacao (cálculo automático)
│   │   └── services/classificacao.ts # Lógica de pontos (3/1/0)
│   └── tests/
│       ├── calcularPontos.test.ts    # 6 testes unitários ✓
│       └── integracao.test.ts        # 5 testes integração (requer DB)
├── frontend/
│   └── src/
│       ├── api/client.ts         # Cliente HTTP com JWT
│       ├── contexts/AuthContext   # Contexto de autenticação
│       └── components/
│           ├── Login/Register     # Autenticação
│           ├── Dashboard          # Visão geral + últimos jogos
│           ├── Times              # CRUD times (admin)
│           ├── Jogos              # CRUD jogos (admin)
│           └── Classificacao      # Tabela com pontos, saldo, etc.
```

**Critérios atendidos:**
1. **Segurança** - JWT obrigatório + `requireAdmin` em POST/PUT/DELETE
2. **Time ≠ Time** - Validação no backend (routes/jogos.ts:28) e frontend (Jogos.tsx:48)
3. **Precisão** - `calcularPontos()`: 3 vitória, 1 empate, 0 derrota; classificação recalcula a cada requisição
4. **Integridade** - Bloqueio via Prisma (erro P2003) e validação manual antes de deletar time

**Para executar:**
```bash
# Backend
cd backend
npx prisma migrate dev --name init
npm run dev

# Frontend
cd frontend
npm run dev
```

