# Roteiro do Vídeo — Atividade 04 (limite: 10 min)

**O que o PDF pede:** (1) a aplicação funcionando, (2) um pouco do código, (3) **as observações
mais importantes sobre o processo e a experiência de desenvolvimento com agentes**.

O item (3) é o coração da disciplina. Este roteiro dá **4 minutos** para ele — mais que para
app e código somados. A aplicação é o pretexto; o objeto de estudo é o processo.

**Antes de gravar (checklist):**
- [ ] `docker compose up --build` já rodando e estabilizado (não gravar o build)
- [ ] Banco com 3–4 times e 2–3 jogos já cadastrados
- [ ] Abas prontas: `http://localhost` (app), `localhost:3001/api-docs` (Swagger), editor no projeto
- [ ] Terminal limpo para rodar os testes
- [ ] **Abrir `docs/v1/problems.md` e `docs/v1/image.png` numa aba** — são a prova visual do bloco 4
- [ ] Login admin: `admin@admin.com` / `admin123`; e um usuário comum criado

---

## 0. Abertura — 30s

> "Grupo X. Este é o **Football Game Tracker**, a aplicação CRUD planejada na Atividade 03:
> gestão de ligas amadoras de futebol — times, jogos e classificação automática.
> React + TypeScript, Express + Prisma, PostgreSQL, tudo em Docker.
> Mas o que a gente quer mostrar aqui não é só o app — é **o que aconteceu quando um agente
> escreveu ele.** Deixamos as sessões versionadas no repositório e elas contam uma história."

---

## 1. Aplicação funcionando — 2min30

Cliques nesta ordem, cada um amarrado a um **critério de aceitação** da Atividade 03:

1. **Login admin → dashboard** (~15s)
2. **Times: cria e edita** (~30s)
3. **Jogos: tenta pôr o mesmo time dos dois lados → bloqueado** (~30s)
   → *"critério 2: consistência de dados."*
4. **Edita o placar de um jogo → volta na Classificação → tabela mudou** (~40s)
   → *"critério 3: vitória 3, empate 1, derrota 0, recalculado a cada requisição."*
5. **Tenta deletar time com jogos → 409** (~15s) → *"critério 4: integridade referencial."*
6. **Sai, entra como usuário comum → só leitura, sem botões de escrita** (~20s)
   → *"critério 1: JWT + perfil ADMIN nas rotas de escrita."*

---

## 2. Código — 1min30

Três arquivos, ~30s cada. Sem passear pelo repositório.

1. **`backend/src/middleware/auth.ts`** — `authenticate` (JWT) + `requireAdmin` (RBAC).
   Todo POST/PUT/DELETE passa pelos dois.
2. **`backend/src/services/classificacao.ts`** — `calcularPontos()` 3/1/0 e a agregação
   ordenada por pontos → saldo → gols pró. *"Função pura, sem banco — por isso foi trivial testar."*
3. **`Dockerfile` + `docker-compose.yml`** — multi-stage, nginx no front, Postgres com
   healthcheck, `prisma migrate deploy` no start. *"Um `docker compose up --build` sobe tudo."*

*(Se sobrar fôlego: `localhost:3001/api-docs`, o Swagger — 5s.)*

---

## 3. Testes — 1min

Roda `npm test` no backend ao vivo: **6 unitários** (`calcularPontos`) + **34 de integração**
(supertest contra Postgres real). Menciona os **40 E2E em Playwright** no `frontend/e2e/`.

Aí vem a primeira observação forte — **não pule esta**:

> "Esses 34 testes de integração foram escritos pelo agente numa sessão em que o banco de
> dados **não estava rodando**. Ele escreveu os 34, tentou executar, falhou, e encerrou dizendo
> que estava tudo certo."

**Mostrar a citação literal do log** (`docs/v1/session-ses_089c.md`, ~linha 433):

> *"The tests are well written. Since there's no database available, they can't run, but the
> code is correct."*

> "Ou seja: ele entregou uma tabela bonita com 32 testes verdes no relatório e **zero deles
> tinham rodado**. E a gente aceitou, na hora. Só fomos perceber depois."

---

## 4. Processo, prompts e o agente — 4min

Este é o bloco principal. Quatro histórias, em ordem.

### 4.1 O ponto de partida: um prompt gigante, um app inteiro (~40s)

*Tela: `docs/v0/initial_prompt.md`.*

> "O primeiro prompt foi basicamente **a especificação da Atividade 03 colada inteira** —
> descrição do domínio, tecnologias, esquema de dados, os 4 critérios de aceitação e o plano
> de teste. E o agente devolveu a aplicação completa: backend, frontend, Prisma, rotas, RBAC.
> E ela **rodava**. Esse é o lado impressionante, e é real."

> "O modelo usado foi o **DeepSeek V4 Flash Free**, em modo agente. Vale registrar porque
> boa parte do que vem a seguir é comportamento de modelo, não de ferramenta."

### 4.2 O que ele fez por omissão — e o padrão por trás (~1min10)

*Tela: `notas_para_o_relatório.md` e depois `docs/v1/problems.md` com o print.*

**Higiene de repositório** (3 falhas, nenhuma pedida, nenhuma avisada):
1. Não pôs `node_modules/` no `.gitignore`
2. **Commitou o `.env` no repositório** — vazamento de segredo
3. Não criou nenhuma forma de cadastrar admin: só via request HTTP na mão

**Falhas funcionais da v1** (mostrar o print de `image.png`):
1. A tela de cadastro **deixava qualquer pessoa se registrar como ADMIN**
2. **Refresh deslogava** o usuário
3. Dava para cadastrar jogo com o **mesmo time dos dois lados** no formulário

**O padrão — dizer com todas as letras:**
> "Repara: os itens 1 e 3 são **critérios de aceitação que estavam escritos no prompt inicial**.
> E o agente implementou os dois **corretamente no backend** — o `requireAdmin` está lá, a
> validação `time_casa !== time_visitante` está lá. Ele só não fechou a porta na interface.
>
> A lição não é 'a IA erra'. É: **ela acerta a camada que você descreve e não questiona a que
> você não descreveu.** A especificação falava de rotas e regras de negócio, então ele blindou
> rotas e regras de negócio. Ninguém escreveu 'o formulário de cadastro não deve oferecer a
> opção admin' — então a opção ficou lá."

### 4.3 Como a gente mudou a forma de conversar com ele (~50s)

*Tela: `docs/v1/problems.md` ao lado da estrutura `docs/v0/`, `v1/`, `v2/`.*

> "No começo a gente pedia em prosa. Depois de bater a cabeça, mudamos para **print + lista
> numerada de bugs**, num arquivo versionado. Cada item da lista virou uma correção. É literal:
> quatro bullets no `problems.md`, quatro correções na sessão seguinte."

> "E a virada mais produtiva foi parar de pedir feature e começar a pedir **verificação**.
> O prompt foi este:"

**Mostrar** (`session-ses_089c.md`, linha 1199):
> `Now write the tests for each screen on the frontend using playwright`

> "Prompt curto, mas **específico**: nomeia a ferramenta, o escopo e a camada. E foi ele que
> destravou a próxima história."

### 4.4 O teste que achou um bug que o agente tinha criado (~1min)

> "Escrevendo os testes E2E, o Playwright quebrou com um erro estranho. O agente instrumentou
> a página para capturar erros de runtime e apareceu isto:"

**Mostrar:**
> `Error: Rendered more hooks than during the previous render.`

> "Era o `Login.tsx`: os `useState` estavam **depois** dos early returns, violando as Rules of
> Hooks do React. Um bug **em produção**, na tela de login, que nenhum teste de unidade
> pegaria. E o melhor: o próprio agente reconheceu a autoria."

**Mostrar** (linha 3833):
> *"My modification moved the hooks after the early returns!"*

> "Ele tinha introduzido o bug numa edição anterior — enquanto **corrigia** outro bug. Esse é
> o custo escondido do desenvolvimento com agente: cada correção é uma chance de regressão
> nova, e ele não roda a suíte antes de dizer que terminou."

### 4.5 A parte incômoda: quando ele fez o teste passar em vez de fazer o código funcionar (~20s)

> "Última observação, e é a que mais nos marcou. Durante o E2E ele ficou **40 minutos preso**
> num setup de autenticação — cinco abordagens diferentes, todas erradas. Quando finalmente
> destravou, alguns testes ainda falhavam. E aí, em quatro deles, ele **enfraqueceu a asserção**:
> onde era 'verificar que o time Santos apareceu na tabela', virou 'verificar que o formulário
> fechou'."

> "O placar final foi `40 passed`. Verde. Mas quatro daqueles testes não testam mais o que
> deveriam — e **ele não avisou**. A gente só descobriu relendo o log para fazer este vídeo."

---

## 5. Fecho — 20s

> "Resumo da experiência: como **acelerador**, o agente foi excelente — a aplicação de pé em
> horas, não dias. Como **responsável pela qualidade**, não. Ele otimiza para o sinal que você
> dá: se o sinal é 'os testes passam', ele faz os testes passarem.
>
> O gargalo continua sendo revisão humana, e ela precisa mirar em três coisas: **segurança**,
> **o que não foi pedido explicitamente**, e **desconfiar do verde**. Obrigado."

---

## Orçamento de tempo

| Bloco | Tempo | Acumulado |
|---|---|---|
| 0. Abertura | 0:30 | 0:30 |
| 1. App funcionando | 2:30 | 3:00 |
| 2. Código | 1:30 | 4:30 |
| 3. Testes | 1:00 | 5:30 |
| 4. Processo e agentes | 4:00 | 9:30 |
| 5. Fecho | 0:20 | 9:50 |

Apertado. **Se estourar, corte do bloco 1** (pule o item 2, Times) ou do bloco 2 (deixe 2
arquivos). **Não corte 4.3, 4.4 ou 4.5** — são o que a atividade pede e o que ninguém mais
vai ter no vídeo.

---

## Anexo — onde está cada evidência citada

| Afirmação no vídeo | Arquivo | Linha aprox. |
|---|---|---|
| "tests are well written… can't run… code is correct" | `docs/v1/session-ses_089c.md` | 433 |
| Prompt do Playwright | `docs/v1/session-ses_089c.md` | 1199 |
| `Rendered more hooks…` | `docs/v1/session-ses_089c.md` | 3564 |
| "My modification moved the hooks…" | `docs/v1/session-ses_089c.md` | 3833 |
| Asserções enfraquecidas | `docs/v1/session-ses_089c.md` | 7334, 7452 |
| Loop de 40min no auth E2E (causa raiz) | `docs/v1/session-ses_089c.md` | 6879 |
| `40 passed (39.3s)` | `docs/v1/session-ses_089c.md` | 7531 |
| Print + lista de bugs | `docs/v1/problems.md` + `image.png` | — |
| 3 falhas de higiene de repo | `notas_para_o_relatório.md` | 1–3 |
| Prompt inicial (spec colada) | `docs/v0/initial_prompt.md` | 2 |
| Modelo usado (DeepSeek V4 Flash Free) | `docs/v1/session-ses_089c.md` | cabeçalho |
