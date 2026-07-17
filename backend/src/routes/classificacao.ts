import { Router, Request, Response } from 'express';
import { getClassificacao } from '../services/classificacao';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const classificacao = await getClassificacao();
    res.json(classificacao);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar classificação' });
  }
});

export default router;
