import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Times from './components/Times';
import Jogos from './components/Jogos';
import Classificacao from './components/Classificacao';

function NavBar() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <nav style={{ background: '#1a1a2e', padding: '12px 20px', display: 'flex', gap: 20, alignItems: 'center', color: '#fff' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Football Tracker</Link>
      <Link to="/classificacao" style={{ color: '#ccc', textDecoration: 'none' }}>Classificação</Link>
      {isAdmin && (
        <>
          <Link to="/times" style={{ color: '#ccc', textDecoration: 'none' }}>Times</Link>
          <Link to="/jogos" style={{ color: '#ccc', textDecoration: 'none' }}>Jogos</Link>
        </>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span>{user.nome} ({isAdmin ? 'Admin' : 'Torcedor'})</span>
        <button onClick={logout} style={{ padding: '6px 14px', cursor: 'pointer' }}>Sair</button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f0f2f5' }}>
        <NavBar />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/classificacao" element={<Classificacao />} />
            <Route path="/times" element={<ProtectedRoute adminOnly><Times /></ProtectedRoute>} />
            <Route path="/jogos" element={<ProtectedRoute adminOnly><Jogos /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}
