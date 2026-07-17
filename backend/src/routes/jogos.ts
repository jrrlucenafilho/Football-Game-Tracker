import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const jogos = await prisma.jogo.findMany({
      include: {
        timeCasa: { select: { id: true, nome: true } },
        timeVisitante: { select: { id: true, nome: true } },
      },
      orderBy: { data_hora: 'desc' },
    });
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogos' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const jogo = await prisma.jogo.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        timeCasa: { select: { id: true, nome: true } },
        timeVisitante: { select: { id: true, nome: true } },
      },
    });
    if (!jogo) {
      res.status(404).json({ error: 'Jogo não encontrado' });
      return;
    }
    res.json(jogo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar jogo' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { data_hora, time_casa_id, time_visitante_id, gols_casa, gols_visitante, estadio } = req.body;

  if (!time_casa_id || !time_visitante_id) {
    res.status(400).json({ error: 'Os IDs dos times são obrigatórios' });
    return;
  }

  if (time_casa_id === time_visitante_id) {
    res.status(400).json({ error: 'Um time não pode jogar contra si mesmo' });
    return;
  }

  try {
    const jogo = await prisma.jogo.create({
      data: {
        data_hora: data_hora ? new Date(data_hora) : null,
        time_casa_id,
        time_visitante_id,
        gols_casa: gols_casa ?? 0,
        gols_visitante: gols_visitante ?? 0,
        estadio,
      },
      include: {
        timeCasa: { select: { id: true, nome: true } },
        timeVisitante: { select: { id: true, nome: true } },
      },
    });
    res.status(201).json(jogo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar jogo' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { data_hora, time_casa_id, time_visitante_id, gols_casa, gols_visitante, estadio } = req.body;

  const jogoExistente = await prisma.jogo.findUnique({ where: { id: Number(req.params.id) } });
  if (!jogoExistente) {
    res.status(404).json({ error: 'Jogo não encontrado' });
    return;
  }

  if (time_casa_id && time_visitante_id && time_casa_id === time_visitante_id) {
    res.status(400).json({ error: 'Um time não pode jogar contra si mesmo' });
    return;
  }

  try {
    const jogo = await prisma.jogo.update({
      where: { id: Number(req.params.id) },
      data: {
        data_hora: data_hora ? new Date(data_hora) : undefined,
        time_casa_id,
        time_visitante_id,
        gols_casa,
        gols_visitante,
        estadio,
      },
      include: {
        timeCasa: { select: { id: true, nome: true } },
        timeVisitante: { select: { id: true, nome: true } },
      },
    });
    res.json(jogo);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar jogo' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.jogo.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar jogo' });
  }
});

export default router;
