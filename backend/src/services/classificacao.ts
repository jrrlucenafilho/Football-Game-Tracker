import prisma from '../lib/prisma';

export interface TimeClassificacao {
  timeId: number;
  nome: string;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
}

export function calcularPontos(golsCasa: number, golsVisitante: number): { pontosCasa: number; pontosVisitante: number } {
  if (golsCasa > golsVisitante) return { pontosCasa: 3, pontosVisitante: 0 };
  if (golsCasa < golsVisitante) return { pontosCasa: 0, pontosVisitante: 3 };
  return { pontosCasa: 1, pontosVisitante: 1 };
}

export async function getClassificacao(): Promise<TimeClassificacao[]> {
  const times = await prisma.time.findMany();
  const jogos = await prisma.jogo.findMany();

  const stats = new Map<number, TimeClassificacao>();

  for (const time of times) {
    stats.set(time.id, {
      timeId: time.id,
      nome: time.nome,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldoGols: 0,
    });
  }

  for (const jogo of jogos) {
    const casa = stats.get(jogo.time_casa_id);
    const visitante = stats.get(jogo.time_visitante_id);
    if (!casa || !visitante) continue;

    const { pontosCasa, pontosVisitante } = calcularPontos(jogo.gols_casa, jogo.gols_visitante);

    casa.jogos++;
    casa.pontos += pontosCasa;
    casa.golsPro += jogo.gols_casa;
    casa.golsContra += jogo.gols_visitante;
    casa.saldoGols = casa.golsPro - casa.golsContra;
    if (pontosCasa === 3) casa.vitorias++;
    else if (pontosCasa === 1) casa.empates++;
    else casa.derrotas++;

    visitante.jogos++;
    visitante.pontos += pontosVisitante;
    visitante.golsPro += jogo.gols_visitante;
    visitante.golsContra += jogo.gols_casa;
    visitante.saldoGols = visitante.golsPro - visitante.golsContra;
    if (pontosVisitante === 3) visitante.vitorias++;
    else if (pontosVisitante === 1) visitante.empates++;
    else visitante.derrotas++;
  }

  return Array.from(stats.values()).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
    return b.golsPro - a.golsPro;
  });
}
