import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Jogos() {
  const [jogos, setJogos] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [time_casa_id, setTimeCasaId] = useState('');
  const [time_visitante_id, setTimeVisitanteId] = useState('');
  const [gols_casa, setGolsCasa] = useState('0');
  const [gols_visitante, setGolsVisitante] = useState('0');
  const [estadio, setEstadio] = useState('');
  const [data_hora, setDataHora] = useState('');

  const carregarDados = async () => {
    const [jogosData, timesData] = await Promise.all([api.jogos.list(), api.times.list()]);
    setJogos(jogosData);
    setTimes(timesData);
  };

  useEffect(() => { carregarDados(); }, []);

  const abrirForm = (jogo?: any) => {
    if (jogo) {
      setEditando(jogo);
      setTimeCasaId(String(jogo.time_casa_id));
      setTimeVisitanteId(String(jogo.time_visitante_id));
      setGolsCasa(String(jogo.gols_casa));
      setGolsVisitante(String(jogo.gols_visitante));
      setEstadio(jogo.estadio || '');
      setDataHora(jogo.data_hora ? jogo.data_hora.slice(0, 16) : '');
    } else {
      setEditando(null);
      setTimeCasaId('');
      setTimeVisitanteId('');
      setGolsCasa('0');
      setGolsVisitante('0');
      setEstadio('');
      setDataHora('');
    }
    setShowForm(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (time_casa_id === time_visitante_id) {
      alert('Um time não pode jogar contra si mesmo');
      return;
    }
    try {
      const data = {
        time_casa_id: Number(time_casa_id),
        time_visitante_id: Number(time_visitante_id),
        gols_casa: Number(gols_casa),
        gols_visitante: Number(gols_visitante),
        estadio: estadio || undefined,
        data_hora: data_hora || undefined,
      };
      if (editando) {
        await api.jogos.update(editando.id, data);
      } else {
        await api.jogos.create(data);
      }
      setShowForm(false);
      carregarDados();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;
    try {
      await api.jogos.delete(id);
      carregarDados();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Gerenciar Jogos</h1>
        <button onClick={() => abrirForm()} style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
          Novo Jogo
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>{editando ? 'Editar Jogo' : 'Novo Jogo'}</h3>
          <form onSubmit={salvar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Time Casa *</label>
                <select value={time_casa_id} onChange={e => setTimeCasaId(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}>
                  <option value="">Selecione</option>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label>Time Visitante *</label>
                <select value={time_visitante_id} onChange={e => setTimeVisitanteId(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}>
                  <option value="">Selecione</option>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label>Gols Casa</label>
                <input type="number" min="0" value={gols_casa} onChange={e => setGolsCasa(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Gols Visitante</label>
                <input type="number" min="0" value={gols_visitante} onChange={e => setGolsVisitante(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Estádio</label>
                <input type="text" value={estadio} onChange={e => setEstadio(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label>Data/Hora</label>
                <input type="datetime-local" value={data_hora} onChange={e => setDataHora(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
                {editando ? 'Atualizar' : 'Criar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: '#fff' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Casa</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Placar</th>
            <th style={{ padding: 12, textAlign: 'right' }}>Visitante</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Estádio</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {jogos.map(j => (
            <tr key={j.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12 }}>{j.timeCasa.nome}</td>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>{j.gols_casa} x {j.gols_visitante}</td>
              <td style={{ padding: 12, textAlign: 'right' }}>{j.timeVisitante.nome}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{j.estadio || '-'}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>
                <button onClick={() => abrirForm(j)} style={{ marginRight: 8, padding: '6px 12px', background: '#16213e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Editar</button>
                <button onClick={() => excluir(j.id)} style={{ padding: '6px 12px', background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Excluir</button>
              </td>
            </tr>
          ))}
          {jogos.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>Nenhum jogo cadastrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
