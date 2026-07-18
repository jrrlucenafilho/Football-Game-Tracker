
User: make a ts/js application following these specifications `1. Descrição da Aplicação: O sistema proposto pertence ao domínio de gestão de
competições esportivas e análise de dados de desempenho. O objetivo é oferecer uma
plataforma centralizada para a organização de campeonatos, permitindo o acompanhamento
em tempo real de resultados e a geração automática de estatísticas de classificação.
Definição do Cliente: O público-alvo principal são os Organizadores de Ligas Amadoras
de Futebol Regional. Estes clientes necessitam de uma ferramenta profissional para
substituir planilhas manuais, garantindo a integridade dos dados e a transparência dos
resultados para as equipes participantes.
O outro tipo de cliente é o Torcedor, que deseja acompanhar as partidas e toda a
informação relacionada a elas.
A aplicação operará sob o paradigma CRUD, com as seguintes especificidades de domínio:
● Create (Criação): Registro de novas entidades (Times, Usuários) e inserção de
confrontos agendados e resultados finais.
● Read (Leitura): Consulta dinâmica de tabelas de classificação, histórico de jogos e
dashboards.
● Update (Atualização): Manutenção de dados cadastrais e a atualização de placares.
Nota técnica: Uma atualização em um resultado de jogo dispara o recálculo
automático da pontuação (vitórias, empates, derrotas) e saldo de gols das equipes
envolvidas.
● Delete (Remoção): Exclusão de registros em caso de desistência de equipes ou
erros de lançamento, respeitando a integridade referencial para evitar órfãos na base
de dados.
Perfis de Usuário e Controle de Acesso O sistema possuirá um controle de acesso
baseado em funções (RBAC):
● Usuário Administrador (Organizador): Possui permissões totais sobre o ciclo de
vida dos dados. Pode cadastrar times, editar placares de jogos e gerenciar outros
usuários. É o único perfil autorizado a realizar operações de Update e Delete em
registros críticos de partidas.
● Usuário Comum (Público/Torcedor): Perfil com acesso restrito a operações de
Read. Pode visualizar tabelas de classificação, detalhes de partidas e estatísticas de
times, sem capacidade de alteração de qualquer dado no SGBD.


2. Tecnologias a Serem Utilizadas:
Componente Tecnologia Sugerida
Frontend React.js (Typescript/Javascript)1
Backend Node.js (Express)
ORM Prisma
Banco de
Dados
PostgreSQL
3. Experiência Prévia da Equipe: Boa parte da equipe possui experiência com a React.js e
PostgreSQL
4. Esquema de Dados Preliminar
● Usuário
○ id: SERIAL PRIMARY KEY
○ nome: VARCHAR(100) NOT NULL
○ email: VARCHAR(100) UNIQUE NOT NULL
○ senha: VARCHAR(255) (Hash Bcrypt)
○ nivel_acesso: ENUM ('ADMIN', 'COMUM')
● Time
○ id: SERIAL PRIMARY KEY
○ nome: VARCHAR(100) NOT NULL
○ cidade: VARCHAR(100)
○ tecnico: VARCHAR(100)
○ Relacionamento: 1:N com a entidade Jogo (um time participa de vários
jogos).
● Jogo
○ id: SERIAL PRIMARY KEY
○ data_hora: TIMESTAMP
○ time_casa_id: INTEGER FK (References Time.id)
○ time_visitante_id: INTEGER FK (References Time.id)
○ gols_casa: INTEGER DEFAULT 0
○ gols_visitante: INTEGER DEFAULT 0
○ estadio: VARCHAR(100)
5. Critérios de Validação e Aceitação Para a entrega da versão mínima funcional (MVP),
os seguintes critérios são mandatórios:
1. Segurança de Acesso: Rotas de alteração de dados devem exigir obrigatoriamente
um token JWT válido e perfil de Administrador.
2. Consistência de Dados: O sistema não deve permitir que um time jogue contra si
mesmo (validação de ID casa != ID visitante).
3. Precisão nos Cálculos: A tabela de classificação deve ser atualizada em tempo real
após a inserção de um placar, seguindo a lógica: Vitória = 3 pontos, Empate = 1
ponto, Derrota = 0 pontos.
4. Integridade Referencial: Tentativas de deletar um time que possua jogos vinculados
devem ser bloqueadas pelo SGBD.
6. Plano de Teste dos Critérios de Validação e Aceitação
Testes de Unidade: Testes feitos para cada função ou grupo pequeno de funções e
funcionalidades. Com a ajuda de agentes para acelerar o processo.
● Exemplo: Validar se a função calcularPontos(golsCasa, golsVisitante)
retorna corretamente 3 pontos para o vencedor e 1 ponto para ambos em caso de
empate.
Testes de Integração: Validação da persistência no SGBD. Testando a consistência dos
dados das diferentes partes do sistema quando comunicam-se. Feitos por meio de funções
que verificam esses dados e checam a sua consistência em diferentes partes do sistema.
● Exemplo: Simular uma transação de inserção de jogo e verificar se as chaves
estrangeiras estão apontando para os times corretos e se os dados foram gravados
de forma consistente`

Agent: Aplicação completa. Resumo do projeto:

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
