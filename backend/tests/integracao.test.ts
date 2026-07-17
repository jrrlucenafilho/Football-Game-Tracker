import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { calcularPontos, getClassificacao, TimeClassificacao } from '../src/services/classificacao';
import prisma from '../src/lib/prisma';

describe('Testes de Integração', () => {
  beforeAll(async () => {
    await prisma.jogo.deleteMany();
    await prisma.time.deleteMany();
    await prisma.usuario.deleteMany();
  });

  afterAll(async () => {
    await prisma.jogo.deleteMany();
    await prisma.time.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  it('deve criar times e verificar persistência', async () => {
    const time1 = await prisma.time.create({ data: { nome: 'Time A', cidade: 'Cidade A' } });
    const time2 = await prisma.time.create({ data: { nome: 'Time B', cidade: 'Cidade B' } });

    expect(time1.id).toBeDefined();
    expect(time2.id).toBeDefined();

    const times = await prisma.time.findMany();
    expect(times).toHaveLength(2);
  });

  it('deve criar um jogo com chaves estrangeiras corretas', async () => {
    const [time1, time2] = await prisma.time.findMany({ take: 2 });

    const jogo = await prisma.jogo.create({
      data: {
        time_casa_id: time1.id,
        time_visitante_id: time2.id,
        gols_casa: 2,
        gols_visitante: 1,
        estadio: 'Estádio Central',
      },
      include: {
        timeCasa: true,
        timeVisitante: true,
      },
    });

    expect(jogo.time_casa_id).toBe(time1.id);
    expect(jogo.time_visitante_id).toBe(time2.id);
    expect(jogo.timeCasa.nome).toBe('Time A');
    expect(jogo.timeVisitante.nome).toBe('Time B');
    expect(jogo.gols_casa).toBe(2);
    expect(jogo.gols_visitante).toBe(1);
  });

  it('deve calcular corretamente a classificação após inserir jogos', async () => {
    const [time1, time2] = await prisma.time.findMany({ take: 2 });

    const classificacao = await getClassificacao();
    const timeAStats = classificacao.find(t => t.timeId === time1.id);
    const timeBStats = classificacao.find(t => t.timeId === time2.id);

    expect(timeAStats).toBeDefined();
    expect(timeBStats).toBeDefined();
    expect(timeAStats!.jogos).toBe(1);
    expect(timeAStats!.vitorias).toBe(1);
    expect(timeAStats!.pontos).toBe(3);
    expect(timeBStats!.jogos).toBe(1);
    expect(timeBStats!.derrotas).toBe(1);
    expect(timeBStats!.pontos).toBe(0);
  });

  it('deve atualizar classificação corretamente ao atualizar placar', async () => {
    const [time1, time2] = await prisma.time.findMany({ take: 2 });
    const jogo = await prisma.jogo.findFirst();

    await prisma.jogo.update({
      where: { id: jogo!.id },
      data: { gols_casa: 1, gols_visitante: 1 },
    });

    const classificacao = await getClassificacao();
    const timeAStats = classificacao.find(t => t.timeId === time1.id);
    const timeBStats = classificacao.find(t => t.timeId === time2.id);

    expect(timeAStats!.vitorias).toBe(0);
    expect(timeAStats!.empates).toBe(1);
    expect(timeAStats!.pontos).toBe(1);
    expect(timeBStats!.derrotas).toBe(0);
    expect(timeBStats!.empates).toBe(1);
    expect(timeBStats!.pontos).toBe(1);
  });

  it('deve impedir deleção de time com jogos vinculados', async () => {
    const jogo = await prisma.jogo.findFirst();
    expect(jogo).not.toBeNull();

    try {
      await prisma.time.delete({ where: { id: jogo!.time_casa_id } });
      expect.fail('Deveria ter lançado erro');
    } catch (error: any) {
      expect(error.code).toBe('P2003');
    }
  });
});
