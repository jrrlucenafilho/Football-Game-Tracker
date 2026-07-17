import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivelAcesso, setNivelAcesso] = useState<'COMUM' | 'ADMIN'>('COMUM');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(nome, email, senha, nivelAcesso);
      navigate('/login');
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', background: '#fff', padding: 30, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>Cadastro</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Nome</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tipo de conta</label>
          <select value={nivelAcesso} onChange={e => setNivelAcesso(e.target.value as 'COMUM' | 'ADMIN')} style={{ width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' }}>
            <option value="COMUM">Comum</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer' }}>Cadastrar</button>
      </form>
      <p style={{ marginTop: 16, textAlign: 'center' }}>
        Já tem conta? <Link to="/login">Faça login</Link>
      </p>
    </div>
  );
}
