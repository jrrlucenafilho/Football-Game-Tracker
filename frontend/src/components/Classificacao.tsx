import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Classificacao() {
  const [classificacao, setClassificacao] = useState<any[]>([]);

  useEffect(() => {
    api.classificacao.get().then(setClassificacao);
  }, []);

  return (
    <div>
      <h1>Classificação</h1>
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#1a1a2e', color: '#fff' }}>
            <th style={{ padding: 12, textAlign: 'center', width: 40 }}>#</th>
            <th style={{ padding: 12, textAlign: 'left' }}>Time</th>
            <th style={{ padding: 12, textAlign: 'center' }}>P</th>
            <th style={{ padding: 12, textAlign: 'center' }}>J</th>
            <th style={{ padding: 12, textAlign: 'center' }}>V</th>
            <th style={{ padding: 12, textAlign: 'center' }}>E</th>
            <th style={{ padding: 12, textAlign: 'center' }}>D</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Gols Pró</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Gols Contra</th>
            <th style={{ padding: 12, textAlign: 'center' }}>Saldo de Gols</th>
          </tr>
        </thead>
        <tbody>
          {classificacao.map((t, i) => (
            <tr key={t.timeId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
              <td style={{ padding: 12 }}>{t.nome}</td>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>{t.pontos}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.jogos}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.vitorias}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.empates}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.derrotas}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.golsPro}</td>
              <td style={{ padding: 12, textAlign: 'center' }}>{t.golsContra}</td>
              <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>{t.saldoGols > 0 ? `+${t.saldoGols}` : t.saldoGols}</td>
            </tr>
          ))}
          {classificacao.length === 0 && (
            <tr><td colSpan={10} style={{ padding: 20, textAlign: 'center' }}>Nenhum dado de classificação disponível</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
