import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Times() {
  const [times, setTimes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [tecnico, setTecnico] = useState('');

  const carregarTimes = async () => {
    const data = await api.times.list();
    setTimes(data);
  };

  useEffect(() => { carregarTimes(); }, []);

  const abrirForm = (time?: any) => {
    if (time) {
      setEditando(time);
      setNome(time.nome);
      setCidade(time.cidade || '');
      setTecnico(time.tecnico || '');
    } else {
      setEditando(null);
      setNome('');
      setCidade('');
      setTecnico('');
    }
    setShowForm(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.times.update(editando.id, { nome, cidade, tecnico });
      } else {
        await api.times.create({ nome, cidade, tecnico });
      }
      setShowForm(false);
      carregarTimes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este time?')) return;
    try {
      await api.times.delete(id);
      carregarTimes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Gerenciar Times</h1>
        <button onClick={() => abrirForm()} style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
          Novo Time
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>{editando ? 'Editar Time' : 'Novo Time'}</h3>
          <form onSubmit={salvar}>
            <div style={{ marginBottom: 12 }}>
              <label>Nome *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Cidade</label>
              <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Técnico</label>
              <input type="text" value={tecnico} onChange={e => setTecnico(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
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
            <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Nome</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Cidade</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Técnico</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {times.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12 }}>{t.id}</td>
              <td style={{ padding: 12 }}>{t.nome}</td>
              <td style={{ padding: 12 }}>{t.cidade || '-'}</td>
              <td style={{ padding: 12 }}>{t.tecnico || '-'}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>
                <button onClick={() => abrirForm(t)} style={{ marginRight: 8, padding: '6px 12px', background: '#16213e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Editar</button>
                <button onClick={() => excluir(t.id)} style={{ padding: '6px 12px', background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Excluir</button>
              </td>
            </tr>
          ))}
          {times.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>Nenhum time cadastrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
