import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { nome, email, senha, nivel_acesso } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    return;
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) {
    res.status(409).json({ error: 'Email já cadastrado' });
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: senhaHash, nivel_acesso: nivel_acesso || 'COMUM' },
    select: { id: true, nome: true, email: true, nivel_acesso: true },
  });

  res.status(201).json(usuario);
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
    return;
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = jwt.sign(
    { userId: usuario.id, nivel_acesso: usuario.nivel_acesso },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel_acesso: usuario.nivel_acesso },
  });
});

export default router;
