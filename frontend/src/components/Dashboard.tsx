import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ times: 0, jogos: 0 });
  const [ultimosJogos, setUltimosJogos] = useState<any[]>([]);

  useEffect(() => {
    api.times.list().then(t => setStats(s => ({ ...s, times: t.length })));
    api.jogos.list().then(j => {
      setStats(s => ({ ...s, jogos: j.length }));
      setUltimosJogos(j.slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
        <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Times</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.times}</p>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h3>Jogos</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.jogos}</p>
        </div>
      </div>

      {isAdmin && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Link to="/times" style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: 4 }}>Gerenciar Times</Link>
          <Link to="/jogos" style={{ padding: '10px 20px', background: '#16213e', color: '#fff', textDecoration: 'none', borderRadius: 4 }}>Gerenciar Jogos</Link>
        </div>
      )}

      <h2>Últimos Jogos</h2>
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: '#fff' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Casa</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Placar</th>
            <th style={{ padding: 12, textAlign: 'right' }}>Visitante</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Estádio</th>
          </tr>
        </thead>
        <tbody>
          {ultimosJogos.map(j => (
            <tr key={j.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12 }}>{j.timeCasa.nome}</td>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>{j.gols_casa} x {j.gols_visitante}</td>
              <td style={{ padding: 12, textAlign: 'right' }}>{j.timeVisitante.nome}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{j.estadio || '-'}</td>
            </tr>
          ))}
          {ultimosJogos.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center' }}>Nenhum jogo cadastrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
