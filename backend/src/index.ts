import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma';
import authRoutes from './routes/auth';
import timesRoutes from './routes/times';
import jogosRoutes from './routes/jogos';
import classificacaoRoutes from './routes/classificacao';
import usuariosRoutes from './routes/usuarios';

async function seedAdmin() {
  const existingAdmin = await prisma.usuario.findFirst({
    where: { nivel_acesso: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('Admin já existe, pulando seed.');
    return;
  }

  const nome = process.env.ADMIN_NAME || 'Administrador';
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const senha = process.env.ADMIN_PASSWORD || 'admin123';
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: { nome, email, senha: senhaHash, nivel_acesso: 'ADMIN' },
  });

  console.log(`Admin criado: ${email}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/times', timesRoutes);
app.use('/api/jogos', jogosRoutes);
app.use('/api/classificacao', classificacaoRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await seedAdmin();
});

export default app;
