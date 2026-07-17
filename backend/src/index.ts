import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import timesRoutes from './routes/times';
import jogosRoutes from './routes/jogos';
import classificacaoRoutes from './routes/classificacao';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/times', timesRoutes);
app.use('/api/jogos', jogosRoutes);
app.use('/api/classificacao', classificacaoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
