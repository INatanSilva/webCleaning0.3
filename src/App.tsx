import React, { useState, useRef } from 'react';
import './App.css';
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
// Ícone SVG de exclamação inline
const ExclamationIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{display: 'inline', verticalAlign: 'middle'}} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#f59e42" strokeWidth="2" fill="#fff8e1" />
    <rect x="11" y="7" width="2" height="7" rx="1" fill="#f59e42" />
    <rect x="11" y="16" width="2" height="2" rx="1" fill="#f59e42" />
  </svg>
);

const initialState = {
  nome: '',
  numeroContato: '',
  localizacao: '',
  tipoLimpeza: '',
};

function App() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const [nomeTipo, setNomeTipo] = useState<'proprio' | 'empresa'>('proprio');
  const [tooltipNome, setTooltipNome] = useState(false);
  const [tooltipLocalizacao, setTooltipLocalizacao] = useState(false);

  // Máscara para telefone português
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    if (value.length >= 7) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    } else if (value.length >= 4) {
      value = value.replace(/(\d{3})(\d{3})/, '$1 $2');
    } else if (value.length >= 1) {
      value = value.replace(/(\d{3})/, '$1');
    }
    setForm({ ...form, numeroContato: value });
  };

  // Validação visual do telefone
  const handleTelefoneBlur = () => {
    const value = form.numeroContato.replace(/\D/g, '');
    if (telefoneRef.current) {
      telefoneRef.current.style.borderColor = '#e5e7eb';
      if (value.length > 0 && value.length !== 9) {
        telefoneRef.current.style.borderColor = '#ef4444';
        telefoneRef.current.title = 'Número de telefone deve ter 9 dígitos';
      } else if (value.length === 9) {
        telefoneRef.current.style.borderColor = '#10b981';
        telefoneRef.current.title = 'Número válido';
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "requests"), {
        nome: form.nome,
        numeroContato: form.numeroContato,
        localizacao: form.localizacao,
        tipoLimpeza: form.tipoLimpeza,
      });
      setLoading(false);
      setForm(initialState);
      setShowPopup(true);
    } catch (err) {
      setLoading(false);
      alert("Erro ao salvar no Firebase!");
    }
  };

  return (
    <div className="app-bg">
      <div className="container">
        <h1>Solicitar Serviço</h1>
        <p className="subtitle">Preencha os dados para solicitação de limpeza</p>
        <form id="serviceForm" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group" style={{position: 'relative'}}>
            <label htmlFor="nome">{nomeTipo === 'proprio' ? 'Nome completo' : 'Nome da Empresa'}</label>
            <span
              style={{marginLeft: 6, color: '#f59e42', cursor: 'pointer', verticalAlign: 'middle', position: 'relative', display: 'inline-block'}}
              onMouseEnter={() => setTooltipNome(true)}
              onMouseLeave={() => setTooltipNome(false)}
              onTouchStart={() => setTooltipNome(true)}
              onTouchEnd={() => setTooltipNome(false)}
              tabIndex={0}
            >
              <ExclamationIcon />
              {tooltipNome && (
                <div style={{
                  position: 'absolute',
                  left: '120%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#222',
                  color: '#fff',
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}>
                  {nomeTipo === 'proprio' ? 'Digite seu nome completo.' : 'Digite o nome da empresa.'}
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '6px solid #222',
                  }} />
                </div>
              )}
            </span>
            <div style={{display: 'inline-block', marginLeft: 10}}>
              <button type="button" style={{fontSize: 12, padding: '2px 8px', marginRight: 4, background: nomeTipo==='proprio'?'#10b981':'#e5e7eb', color: nomeTipo==='proprio'?'#fff':'#222', border: 'none', borderRadius: 4, cursor: 'pointer'}} onClick={()=>setNomeTipo('proprio')}>Nome próprio</button>
              <button type="button" style={{fontSize: 12, padding: '2px 8px', background: nomeTipo==='empresa'?'#10b981':'#e5e7eb', color: nomeTipo==='empresa'?'#fff':'#222', border: 'none', borderRadius: 4, cursor: 'pointer'}} onClick={()=>setNomeTipo('empresa')}>Empresa</button>
            </div>
            <input
              type="text"
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              placeholder={nomeTipo === 'proprio' ? 'Ex: João Silva' : 'Ex: Limpezas Lisboa Lda.'}
              style={{marginTop: 6}}
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <label htmlFor="numeroContato">Telefone</label>
            <input
              type="tel"
              id="numeroContato"
              name="numeroContato"
              placeholder="9XX XXX XXX"
              value={form.numeroContato}
              onChange={handleTelefoneChange}
              onBlur={handleTelefoneBlur}
              ref={telefoneRef}
              required
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <label htmlFor="localizacao">Localização</label>
            <span
              style={{marginLeft: 6, color: '#f59e42', cursor: 'pointer', verticalAlign: 'middle', position: 'relative', display: 'inline-block'}}
              onMouseEnter={() => setTooltipLocalizacao(true)}
              onMouseLeave={() => setTooltipLocalizacao(false)}
              onTouchStart={() => setTooltipLocalizacao(true)}
              onTouchEnd={() => setTooltipLocalizacao(false)}
              tabIndex={0}
            >
              <ExclamationIcon />
              {tooltipLocalizacao && (
                <div style={{
                  position: 'absolute',
                  left: '120%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#222',
                  color: '#fff',
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}>
                  Local aonde será realizado o serviço desejado.
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '6px solid #222',
                  }} />
                </div>
              )}
            </span>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              placeholder="Ex: Lisboa, Rua Augusta 100"
              value={form.localizacao}
              onChange={handleChange}
              required
              style={{marginTop: 6}}
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipoLimpeza">Tipo de Serviço</label>
            <select
              id="tipoLimpeza"
              name="tipoLimpeza"
              value={form.tipoLimpeza}
              onChange={handleChange}
              required
            >
              <option value="">Selecione o serviço...</option>
              <option value="Limpeza Residencial">Limpeza Residencial</option>
              <option value="Limpeza Comercial">Limpeza Comercial</option>
              <option value="Limpeza Pós-Obra">Limpeza Pós-Obra</option>
              <option value="Limpeza Profunda">Limpeza Profunda</option>
              <option value="Limpeza de Escritório">Limpeza de Escritório</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <button type="submit" className={`btn-submit${loading ? ' loading' : ''}`} disabled={loading}>
            {loading ? '' : 'Enviar Solicitação'}
          </button>
        </form>
        {showPopup && (
          <div className="popupSuccess">
            <div className="popupContent">
              <span className="popupCheck">&#10003;</span>
              <h2>Pedido enviado!</h2>
              <p>Sua solicitação foi enviada com sucesso.<br/>Entraremos em contato em até 24h.</p>
              <button
                className="popupBtn"
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
        {/* Tooltip global removido, agora é local ao ícone */}
      </div>
    </div>
  );
}

export default App; 