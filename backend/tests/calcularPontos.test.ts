import { describe, it, expect } from 'vitest';
import { calcularPontos } from '../src/services/classificacao';

describe('calcularPontos', () => {
  it('deve retornar 3 pontos para o vencedor (casa)', () => {
    const result = calcularPontos(3, 1);
    expect(result.pontosCasa).toBe(3);
    expect(result.pontosVisitante).toBe(0);
  });

  it('deve retornar 3 pontos para o vencedor (visitante)', () => {
    const result = calcularPontos(0, 2);
    expect(result.pontosCasa).toBe(0);
    expect(result.pontosVisitante).toBe(3);
  });

  it('deve retornar 1 ponto para cada time em caso de empate', () => {
    const result = calcularPontos(2, 2);
    expect(result.pontosCasa).toBe(1);
    expect(result.pontosVisitante).toBe(1);
  });

  it('deve retornar 0-0 com empate em 0 a 0', () => {
    const result = calcularPontos(0, 0);
    expect(result.pontosCasa).toBe(1);
    expect(result.pontosVisitante).toBe(1);
  });

  it('deve retornar 3-0 para vitoria de 5 a 0', () => {
    const result = calcularPontos(5, 0);
    expect(result.pontosCasa).toBe(3);
    expect(result.pontosVisitante).toBe(0);
  });

  it('deve retornar 0-3 para vitoria de 1 a 4', () => {
    const result = calcularPontos(1, 4);
    expect(result.pontosCasa).toBe(0);
    expect(result.pontosVisitante).toBe(3);
  });
});
