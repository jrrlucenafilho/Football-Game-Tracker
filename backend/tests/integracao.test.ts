import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../src/index';
import prisma from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let timeCasaId: number;
let timeVisitanteId: number;
let usuarioId: number;

beforeAll(async () => {
  await prisma.jogo.deleteMany();
  await prisma.time.deleteMany();
  await prisma.usuario.deleteMany();

  const hash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin@teste.com', senha: hash, nivel_acesso: 'ADMIN' },
  });

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@teste.com', senha: 'admin123' });
  adminToken = adminRes.body.token;

  await prisma.usuario.create({
    data: { nome: 'User', email: 'user@teste.com', senha: hash, nivel_acesso: 'COMUM' },
  });

  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@teste.com', senha: 'admin123' });
  userToken = userRes.body.token;
});

afterAll(async () => {
  await prisma.jogo.deleteMany();
  await prisma.time.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.$disconnect();
});

describe('Auth', () => {
  it('POST /api/auth/register - deve registrar novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Novo', email: 'novo@teste.com', senha: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('novo@teste.com');
    expect(res.body.nivel_acesso).toBe('COMUM');
    expect(res.body).not.toHaveProperty('senha');

    await prisma.usuario.delete({ where: { email: 'novo@teste.com' } });
  });

  it('POST /api/auth/register - deve rejeitar campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Incompleto' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('obrigatórios');
  });

  it('POST /api/auth/register - deve rejeitar email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Duplicado', email: 'admin@teste.com', senha: '123456' });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login - deve autenticar com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe('admin@teste.com');
  });

  it('POST /api/auth/login - deve rejeitar senha inválida', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'errada' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login - deve rejeitar email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@teste.com', senha: '123456' });
    expect(res.status).toBe(401);
  });
});

describe('Times (público)', () => {
  it('GET /api/times - deve retornar lista vazia', async () => {
    const res = await request(app).get('/api/times');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/times - deve listar times cadastrados', async () => {
    const t1 = await prisma.time.create({ data: { nome: 'Time A' } });
    const t2 = await prisma.time.create({ data: { nome: 'Time B' } });

    const res = await request(app).get('/api/times');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    await prisma.time.deleteMany();
  });

  it('GET /api/times/:id - deve retornar time por ID', async () => {
    const time = await prisma.time.create({ data: { nome: 'Time X' } });

    const res = await request(app).get(`/api/times/${time.id}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Time X');

    await prisma.time.deleteMany();
  });

  it('GET /api/times/:id - deve retornar 404 para ID inexistente', async () => {
    const res = await request(app).get('/api/times/99999');
    expect(res.status).toBe(404);
  });
});

describe('Times (admin)', () => {
  beforeEach(async () => {
    await prisma.time.deleteMany();
  });

  it('POST /api/times - deve criar time com token admin', async () => {
    const res = await request(app)
      .post('/api/times')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Time Admin', cidade: 'Cidade', tecnico: 'Técnico' });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Time Admin');
  });

  it('POST /api/times - deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .post('/api/times')
      .send({ nome: 'Time' });
    expect(res.status).toBe(401);
  });

  it('POST /api/times - deve rejeitar com token de usuário comum', async () => {
    const res = await request(app)
      .post('/api/times')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nome: 'Time' });
    expect(res.status).toBe(403);
  });

  it('POST /api/times - deve rejeitar sem nome', async () => {
    const res = await request(app)
      .post('/api/times')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cidade: 'Cidade' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/times/:id - deve atualizar time', async () => {
    const time = await prisma.time.create({ data: { nome: 'Original' } });

    const res = await request(app)
      .put(`/api/times/${time.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Atualizado', cidade: 'Nova Cidade' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Atualizado');
  });

  it('DELETE /api/times/:id - deve excluir time sem jogos', async () => {
    const time = await prisma.time.create({ data: { nome: 'Removível' } });

    const res = await request(app)
      .delete(`/api/times/${time.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/times/:id - deve bloquear exclusão de time com jogos', async () => {
    const t1 = await prisma.time.create({ data: { nome: 'Casa' } });
    const t2 = await prisma.time.create({ data: { nome: 'Visitante' } });
    await prisma.jogo.create({
      data: { time_casa_id: t1.id, time_visitante_id: t2.id },
    });

    const res = await request(app)
      .delete(`/api/times/${t1.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});

describe('Jogos', () => {
  beforeEach(async () => {
    await prisma.jogo.deleteMany();
    await prisma.time.deleteMany();
    const t1 = await prisma.time.create({ data: { nome: 'Casa' } });
    const t2 = await prisma.time.create({ data: { nome: 'Visitante' } });
    timeCasaId = t1.id;
    timeVisitanteId = t2.id;
  });

  it('POST /api/jogos - deve criar jogo', async () => {
    const res = await request(app)
      .post('/api/jogos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        time_casa_id: timeCasaId,
        time_visitante_id: timeVisitanteId,
        gols_casa: 2,
        gols_visitante: 1,
        estadio: 'Estádio',
      });
    expect(res.status).toBe(201);
    expect(res.body.gols_casa).toBe(2);
  });

  it('POST /api/jogos - deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .post('/api/jogos')
      .send({ time_casa_id: timeCasaId, time_visitante_id: timeVisitanteId });
    expect(res.status).toBe(401);
  });

  it('POST /api/jogos - deve rejeitar com token comum', async () => {
    const res = await request(app)
      .post('/api/jogos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ time_casa_id: timeCasaId, time_visitante_id: timeVisitanteId });
    expect(res.status).toBe(403);
  });

  it('GET /api/jogos - deve listar jogos com times populados', async () => {
    await prisma.jogo.create({
      data: { time_casa_id: timeCasaId, time_visitante_id: timeVisitanteId, gols_casa: 3, gols_visitante: 0 },
    });

    const res = await request(app).get('/api/jogos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].timeCasa.nome).toBe('Casa');
    expect(res.body[0].timeVisitante.nome).toBe('Visitante');
  });

  it('PUT /api/jogos/:id - deve atualizar jogo', async () => {
    const jogo = await prisma.jogo.create({
      data: { time_casa_id: timeCasaId, time_visitante_id: timeVisitanteId, gols_casa: 0, gols_visitante: 0 },
    });

    const res = await request(app)
      .put(`/api/jogos/${jogo.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ gols_casa: 5, gols_visitante: 1 });
    expect(res.status).toBe(200);
    expect(res.body.gols_casa).toBe(5);
    expect(res.body.gols_visitante).toBe(1);
  });

  it('DELETE /api/jogos/:id - deve excluir jogo', async () => {
    const jogo = await prisma.jogo.create({
      data: { time_casa_id: timeCasaId, time_visitante_id: timeVisitanteId },
    });

    const res = await request(app)
      .delete(`/api/jogos/${jogo.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});

describe('Classificação', () => {
  it('GET /api/classificacao - deve retornar classificação vazia', async () => {
    await prisma.jogo.deleteMany();
    await prisma.time.deleteMany();

    const res = await request(app).get('/api/classificacao');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/classificacao - deve calcular pontos corretamente', async () => {
    await prisma.jogo.deleteMany();
    await prisma.time.deleteMany();
    const t1 = await prisma.time.create({ data: { nome: 'Vencedor' } });
    const t2 = await prisma.time.create({ data: { nome: 'Perdedor' } });
    await prisma.jogo.create({
      data: { time_casa_id: t1.id, time_visitante_id: t2.id, gols_casa: 3, gols_visitante: 0 },
    });

    const res = await request(app).get('/api/classificacao');
    expect(res.status).toBe(200);
    const time1 = res.body.find((t: any) => t.timeId === t1.id);
    const time2 = res.body.find((t: any) => t.timeId === t2.id);
    expect(time1.pontos).toBe(3);
    expect(time1.vitorias).toBe(1);
    expect(time2.pontos).toBe(0);
    expect(time2.derrotas).toBe(1);
  });
});

describe('Usuários (admin)', () => {
  beforeAll(async () => {
    await prisma.usuario.deleteMany();
    const hash = await bcrypt.hash('admin123', 10);
    await prisma.usuario.create({
      data: { nome: 'Admin', email: 'admin@teste.com', senha: hash, nivel_acesso: 'ADMIN' },
    });
    await prisma.usuario.create({
      data: { nome: 'User', email: 'user@teste.com', senha: hash, nivel_acesso: 'COMUM' },
    });

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'admin123' });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@teste.com', senha: 'admin123' });
    userToken = userRes.body.token;
  });

  it('GET /api/usuarios - deve listar usuários sem campo senha', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).not.toHaveProperty('senha');
  });

  it('GET /api/usuarios - deve rejeitar sem token', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });

  it('GET /api/usuarios - deve rejeitar com token comum', async () => {
    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('POST /api/usuarios - deve criar novo usuário', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Criado', email: 'criado@teste.com', senha: '123456', nivel_acesso: 'COMUM' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('criado@teste.com');
    expect(res.body).not.toHaveProperty('senha');
    usuarioId = res.body.id;
  });

  it('POST /api/usuarios - deve rejeitar email duplicado', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Duplicado', email: 'criado@teste.com', senha: '123456' });
    expect(res.status).toBe(409);
  });

  it('POST /api/usuarios - deve rejeitar campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'SemEmail' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/usuarios/:id - deve atualizar nome e nível', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: 'Atualizado', nivel_acesso: 'ADMIN' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Atualizado');
    expect(res.body.nivel_acesso).toBe('ADMIN');
  });

  it('PUT /api/usuarios/:id - deve atualizar senha se informada', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ senha: 'novaSenha123' });
    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'criado@teste.com', senha: 'novaSenha123' });
    expect(loginRes.status).toBe(200);
  });

  it('DELETE /api/usuarios/:id - deve excluir usuário', async () => {
    const res = await request(app)
      .delete(`/api/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
