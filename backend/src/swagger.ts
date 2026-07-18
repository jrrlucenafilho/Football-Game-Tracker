import { OpenAPIV3 } from 'openapi-types';

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Football Game Tracker API',
    version: '1.0.0',
    description: `API para gerenciamento de campeonatos de futebol.

## Sobre
Sistema de controle de times, jogos e classificação de campeonatos de futebol. Permite cadastrar times, registrar partidas com resultados e visualizar a tabela de classificação calculada automaticamente.

## Autenticação
A API utiliza JWT (Bearer Token) para autenticação. Para acessar rotas protegidas:
1. Cadastre-se em \`POST /api/auth/register\` ou faça login com um usuário existente em \`POST /api/auth/login\`
2. Copie o token retornado
3. Clique no botão **Authorize** (canto superior direito) e insira \`Bearer <seu-token>\`

### Níveis de Acesso
- **COMUM** - Pode visualizar times, jogos e classificação
- **ADMIN** - Pode criar, editar e excluir times, jogos e gerenciar usuários

### Admin Padrão
- Email: \`admin@admin.com\`
- Senha: \`admin123\`
*(criado automaticamente na primeira execução)*
`,
    contact: {
      name: 'Desenvolvedor',
    },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Servidor de Desenvolvimento' },
  ],
  tags: [
    { name: 'Autenticação', description: 'Registro e login de usuários' },
    { name: 'Times', description: 'Gerenciamento de times' },
    { name: 'Jogos', description: 'Gerenciamento de partidas' },
    { name: 'Classificação', description: 'Tabela de classificação do campeonato' },
    { name: 'Usuários', description: 'Gerenciamento de usuários (admin only)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT no formato: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string', description: 'Mensagem de erro' } },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do usuário' },
          nome: { type: 'string', description: 'Nome do usuário' },
          email: { type: 'string', format: 'email', description: 'Email do usuário' },
          nivel_acesso: { type: 'string', enum: ['ADMIN', 'COMUM'], description: 'Nível de acesso' },
          createdAt: { type: 'string', format: 'date-time', description: 'Data de criação' },
        },
      },
      UsuarioInput: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', description: 'Nome do usuário' },
          email: { type: 'string', format: 'email', description: 'Email do usuário' },
          senha: { type: 'string', minLength: 6, description: 'Senha do usuário' },
          nivel_acesso: { type: 'string', enum: ['ADMIN', 'COMUM'], description: 'Nível de acesso (padrão: COMUM)' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', description: 'Email do usuário' },
          senha: { type: 'string', description: 'Senha do usuário' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'Token JWT (válido por 24h)' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      Time: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do time' },
          nome: { type: 'string', description: 'Nome do time' },
          cidade: { type: 'string', nullable: true, description: 'Cidade do time' },
          tecnico: { type: 'string', nullable: true, description: 'Nome do técnico' },
        },
      },
      TimeInput: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', description: 'Nome do time' },
          cidade: { type: 'string', description: 'Cidade do time (opcional)' },
          tecnico: { type: 'string', description: 'Nome do técnico (opcional)' },
        },
      },
      Jogo: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'ID do jogo' },
          data_hora: { type: 'string', format: 'date-time', nullable: true, description: 'Data e hora da partida' },
          time_casa_id: { type: 'integer', description: 'ID do time da casa' },
          time_visitante_id: { type: 'integer', description: 'ID do time visitante' },
          gols_casa: { type: 'integer', description: 'Gols do time da casa' },
          gols_visitante: { type: 'integer', description: 'Gols do time visitante' },
          estadio: { type: 'string', nullable: true, description: 'Estádio da partida' },
          timeCasa: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
            },
          },
          timeVisitante: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              nome: { type: 'string' },
            },
          },
        },
      },
      JogoInput: {
        type: 'object',
        required: ['time_casa_id', 'time_visitante_id'],
        properties: {
          data_hora: { type: 'string', format: 'date-time', description: 'Data e hora da partida (opcional)' },
          time_casa_id: { type: 'integer', description: 'ID do time da casa' },
          time_visitante_id: { type: 'integer', description: 'ID do time visitante' },
          gols_casa: { type: 'integer', description: 'Gols do time da casa (padrão: 0)' },
          gols_visitante: { type: 'integer', description: 'Gols do time visitante (padrão: 0)' },
          estadio: { type: 'string', description: 'Estádio da partida (opcional)' },
        },
      },
      ClassificacaoItem: {
        type: 'object',
        properties: {
          timeId: { type: 'integer', description: 'ID do time' },
          nome: { type: 'string', description: 'Nome do time' },
          pontos: { type: 'integer', description: 'Total de pontos' },
          jogos: { type: 'integer', description: 'Total de jogos disputados' },
          vitorias: { type: 'integer', description: 'Total de vitórias' },
          empates: { type: 'integer', description: 'Total de empates' },
          derrotas: { type: 'integer', description: 'Total de derrotas' },
          golsPro: { type: 'integer', description: 'Gols marcados' },
          golsContra: { type: 'integer', description: 'Gols sofridos' },
          saldoGols: { type: 'integer', description: 'Saldo de gols (golsPro - golsContra)' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Registrar novo usuário',
        description: 'Cria um novo usuário. O nível de acesso padrão é COMUM.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioInput' },
              example: {
                nome: 'João Silva',
                email: 'joao@email.com',
                senha: '123456',
                nivel_acesso: 'COMUM',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Usuario' },
                example: {
                  id: 1,
                  nome: 'João Silva',
                  email: 'joao@email.com',
                  nivel_acesso: 'COMUM',
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos (campos obrigatórios faltando)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Nome, email e senha são obrigatórios' } } },
          },
          '409': {
            description: 'Email já cadastrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Email já cadastrado' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticar usuário',
        description: 'Realiza login e retorna um token JWT válido por 24 horas.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
              example: { email: 'admin@admin.com', senha: 'admin123' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIs...',
                  usuario: {
                    id: 1,
                    nome: 'Administrador',
                    email: 'admin@admin.com',
                    nivel_acesso: 'ADMIN',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Dados inválidos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Email e senha são obrigatórios' } } },
          },
          '401': {
            description: 'Credenciais inválidas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Credenciais inválidas' } } },
          },
        },
      },
    },
    '/api/times': {
      get: {
        tags: ['Times'],
        summary: 'Listar todos os times',
        description: 'Retorna uma lista com todos os times cadastrados, ordenados por nome.',
        responses: {
          '200': {
            description: 'Lista de times',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Time' } },
                example: [
                  { id: 1, nome: 'Sport Recife', cidade: 'Recife', tecnico: 'Pepinho' },
                  { id: 2, nome: 'Santa Cruz', cidade: 'Recife', tecnico: null },
                ],
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      post: {
        tags: ['Times'],
        summary: 'Criar novo time',
        description: 'Cria um novo time. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TimeInput' },
              example: { nome: 'Sport Recife', cidade: 'Recife', tecnico: 'Pepinho' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Time criado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Time' } } },
          },
          '400': {
            description: 'Nome do time é obrigatório',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': { description: 'Token não fornecido ou inválido' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
    },
    '/api/times/{id}': {
      get: {
        tags: ['Times'],
        summary: 'Buscar time por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do time' },
        ],
        responses: {
          '200': {
            description: 'Dados do time',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Time' } } },
          },
          '404': {
            description: 'Time não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Time não encontrado' } } },
          },
        },
      },
      put: {
        tags: ['Times'],
        summary: 'Atualizar time',
        description: 'Atualiza os dados de um time existente. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do time' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TimeInput' },
              example: { nome: 'Sport Recife', cidade: 'Recife', tecnico: 'Novo Técnico' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Time atualizado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Time' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
      delete: {
        tags: ['Times'],
        summary: 'Excluir time',
        description: 'Exclui um time. Não é possível excluir times que possuem jogos vinculados. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do time' },
        ],
        responses: {
          '204': { description: 'Time excluído com sucesso (sem corpo)' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
          '409': {
            description: 'Time possui jogos vinculados',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { error: 'Não é possível excluir o time pois existem jogos vinculados a ele' } } },
          },
        },
      },
    },
    '/api/jogos': {
      get: {
        tags: ['Jogos'],
        summary: 'Listar todos os jogos',
        description: 'Retorna todos os jogos cadastrados com os nomes dos times, ordenados por data/hora decrescente.',
        responses: {
          '200': {
            description: 'Lista de jogos',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Jogo' } },
                example: [
                  {
                    id: 1,
                    data_hora: '2026-07-18T20:00:00.000Z',
                    time_casa_id: 1,
                    time_visitante_id: 2,
                    gols_casa: 3,
                    gols_visitante: 1,
                    estadio: 'Ilha do Retiro',
                    timeCasa: { id: 1, nome: 'Sport Recife' },
                    timeVisitante: { id: 2, nome: 'Santa Cruz' },
                  },
                ],
              },
            },
          },
        },
      },
      post: {
        tags: ['Jogos'],
        summary: 'Criar novo jogo',
        description: 'Registra uma nova partida. Times devem ser diferentes. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JogoInput' },
              example: {
                data_hora: '2026-07-18T20:00:00.000Z',
                time_casa_id: 1,
                time_visitante_id: 2,
                gols_casa: 3,
                gols_visitante: 1,
                estadio: 'Ilha do Retiro',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Jogo criado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogo' } } },
          },
          '400': {
            description: 'Dados inválidos (times obrigatórios, times iguais)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
    },
    '/api/jogos/{id}': {
      get: {
        tags: ['Jogos'],
        summary: 'Buscar jogo por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do jogo' },
        ],
        responses: {
          '200': {
            description: 'Dados do jogo',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogo' } } },
          },
          '404': {
            description: 'Jogo não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      put: {
        tags: ['Jogos'],
        summary: 'Atualizar jogo',
        description: 'Atualiza os dados de uma partida existente. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do jogo' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JogoInput' },
              example: {
                gols_casa: 2,
                gols_visitante: 2,
                estadio: 'Arena Pernambuco',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Jogo atualizado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Jogo' } } },
          },
          '400': {
            description: 'Times iguais (se ambos fornecidos)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
          '404': {
            description: 'Jogo não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      delete: {
        tags: ['Jogos'],
        summary: 'Excluir jogo',
        description: 'Exclui uma partida. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do jogo' },
        ],
        responses: {
          '204': { description: 'Jogo excluído com sucesso (sem corpo)' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
    },
    '/api/classificacao': {
      get: {
        tags: ['Classificação'],
        summary: 'Obter tabela de classificação',
        description: `Retorna a tabela de classificação calculada automaticamente com base nos resultados dos jogos.

**Regras de pontuação:**
- Vitória: 3 pontos
- Empate: 1 ponto
- Derrota: 0 pontos

**Critérios de desempate (ordem):**
1. Pontos
2. Saldo de gols
3. Gols pró (marcados)`,
        responses: {
          '200': {
            description: 'Tabela de classificação',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/ClassificacaoItem' } },
                example: [
                  { timeId: 1, nome: 'Sport Recife', pontos: 6, jogos: 2, vitorias: 2, empates: 0, derrotas: 0, golsPro: 5, golsContra: 1, saldoGols: 4 },
                  { timeId: 2, nome: 'Santa Cruz', pontos: 0, jogos: 2, vitorias: 0, empates: 0, derrotas: 2, golsPro: 1, golsContra: 5, saldoGols: -4 },
                ],
              },
            },
          },
          '500': {
            description: 'Erro interno',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/usuarios': {
      get: {
        tags: ['Usuários'],
        summary: 'Listar todos os usuários',
        description: 'Retorna todos os usuários cadastrados (sem o campo senha). Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista de usuários',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
      post: {
        tags: ['Usuários'],
        summary: 'Criar novo usuário (admin)',
        description: 'Cria um novo usuário. Permite definir nível de acesso. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UsuarioInput' },
              example: { nome: 'Novo Usuário', email: 'novo@email.com', senha: '123456', nivel_acesso: 'COMUM' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
          },
          '400': {
            description: 'Dados inválidos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
          '409': {
            description: 'Email já cadastrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por ID',
        description: 'Retorna os dados de um usuário específico. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do usuário' },
        ],
        responses: {
          '200': {
            description: 'Dados do usuário',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
          '404': {
            description: 'Usuário não encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualizar usuário',
        description: 'Atualiza os dados de um usuário. Todos os campos são opcionais na atualização. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do usuário' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  senha: { type: 'string', minLength: 6 },
                  nivel_acesso: { type: 'string', enum: ['ADMIN', 'COMUM'] },
                },
              },
              example: { nome: 'Nome Atualizado', nivel_acesso: 'ADMIN' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuário atualizado com sucesso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
          '409': {
            description: 'Email já cadastrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Excluir usuário',
        description: 'Exclui um usuário do sistema. Requer autenticação de administrador.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID do usuário' },
        ],
        responses: {
          '204': { description: 'Usuário excluído com sucesso (sem corpo)' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Acesso negado (requer ADMIN)' },
        },
      },
    },
  },
};
