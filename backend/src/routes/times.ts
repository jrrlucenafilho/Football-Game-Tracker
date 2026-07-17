import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const times = await prisma.time.findMany({ orderBy: { nome: 'asc' } });
    res.json(times);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar times' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const time = await prisma.time.findUnique({ where: { id: Number(req.params.id) } });
    if (!time) {
      res.status(404).json({ error: 'Time não encontrado' });
      return;
    }
    res.json(time);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar time' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { nome, cidade, tecnico } = req.body;

  if (!nome) {
    res.status(400).json({ error: 'Nome do time é obrigatório' });
    return;
  }

  try {
    const time = await prisma.time.create({ data: { nome, cidade, tecnico } });
    res.status(201).json(time);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar time' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { nome, cidade, tecnico } = req.body;

  try {
    const time = await prisma.time.update({
      where: { id: Number(req.params.id) },
      data: { nome, cidade, tecnico },
    });
    res.json(time);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar time' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const jogosVinculados = await prisma.jogo.count({
      where: {
        OR: [
          { time_casa_id: Number(req.params.id) },
          { time_visitante_id: Number(req.params.id) },
        ],
      },
    });

    if (jogosVinculados > 0) {
      res.status(409).json({
        error: 'Não é possível excluir o time pois existem jogos vinculados a ele',
      });
      return;
    }

    await prisma.time.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar time' });
  }
});

export default router;
