import React, { useState, useRef } from 'react';
import './App.css';
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";

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
          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="localizacao">Localização</label>
            <input
              type="text"
              id="localizacao"
              name="localizacao"
              placeholder="Ex: Lisboa, Porto..."
              value={form.localizacao}
              onChange={handleChange}
              required
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
              <p>Sua solicitação foi enviada com sucesso.</p>
              <button
                className="popupBtn"
                onClick={() => setShowPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 