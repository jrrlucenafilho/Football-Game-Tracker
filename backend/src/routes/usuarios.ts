import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, nivel_acesso: true, createdAt: true },
      orderBy: { nome: 'asc' },
    });
    res.json(usuarios);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true, nome: true, email: true, nivel_acesso: true, createdAt: true },
    });
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }
    res.json(usuario);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha, nivel_acesso } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    return;
  }

  try {
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, nivel_acesso: nivel_acesso || 'COMUM' },
      select: { id: true, nome: true, email: true, nivel_acesso: true, createdAt: true },
    });
    res.status(201).json(usuario);
  } catch {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha, nivel_acesso } = req.body;

  try {
    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (nivel_acesso !== undefined) data.nivel_acesso = nivel_acesso;
    if (senha) data.senha = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, nome: true, email: true, nivel_acesso: true, createdAt: true },
    });
    res.json(usuario);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.usuario.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;
