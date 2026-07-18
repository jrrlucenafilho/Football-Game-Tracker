import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<'COMUM' | 'ADMIN'>('COMUM');

  const carregarUsuarios = async () => {
    const data = await api.usuarios.list();
    setUsuarios(data);
  };

  useEffect(() => { carregarUsuarios(); }, []);

  const abrirForm = (usuario?: any) => {
    if (usuario) {
      setEditando(usuario);
      setNome(usuario.nome);
      setEmail(usuario.email);
      setSenha('');
      setNivelAcesso(usuario.nivel_acesso);
    } else {
      setEditando(null);
      setNome('');
      setEmail('');
      setSenha('');
      setNivelAcesso('COMUM');
    }
    setShowForm(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        const data: any = { nome, email, nivel_acesso: nivelAcesso };
        if (senha) data.senha = senha;
        await api.usuarios.update(editando.id, data);
      } else {
        await api.usuarios.create({ nome, email, senha, nivel_acesso: nivelAcesso });
      }
      setShowForm(false);
      carregarUsuarios();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.usuarios.delete(id);
      carregarUsuarios();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Gerenciar Usuários</h1>
        <button onClick={() => abrirForm()} style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>
          Novo Usuário
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <form onSubmit={salvar}>
            <div style={{ marginBottom: 12 }}>
              <label>Nome *</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>{editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required={!editando} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Tipo de conta</label>
              <select value={nivelAcesso} onChange={e => setNivelAcesso(e.target.value as 'COMUM' | 'ADMIN')} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}>
                <option value="COMUM">Comum</option>
                <option value="ADMIN">Administrador</option>
              </select>
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
            <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Tipo</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12 }}>{u.id}</td>
              <td style={{ padding: 12 }}>{u.nome}</td>
              <td style={{ padding: 12 }}>{u.email}</td>
              <td style={{ padding: 12 }}>{u.nivel_acesso === 'ADMIN' ? 'Administrador' : 'Comum'}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>
                <button onClick={() => abrirForm(u)} style={{ marginRight: 8, padding: '6px 12px', background: '#16213e', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Editar</button>
                <button onClick={() => excluir(u.id)} style={{ padding: '6px 12px', background: '#e94560', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 4 }}>Excluir</button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center' }}>Nenhum usuário cadastrado</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
