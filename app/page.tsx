'use client';

import React, { useState } from 'react';

// ==========================================
// TIPOS E INTERFACES
// ==========================================
interface User {
  nome: string;
  perfil: 'colaborador' | 'gestor' | 'administrador';
}

interface PDV {
  id: number;
  nome: string;
  codigo: string;
}

interface Tarefa {
  id: number;
  categoria: string;
  descricao: string;
  obrigatoria: boolean;
}

interface Aba {
  id: number;
  nome: string;
  tarefas: Tarefa[];
}

interface Checklist {
  nome: string;
  abas: Aba[];
}

interface RespostaState {
  [key: number]: {
    conforme?: boolean;
    observacao?: string;
    casoAberto?: boolean;
    ncDetalhes?: {
      descricao: string;
      prioridade: string;
    };
  };
}

// ==========================================
// DADOS DE EXEMPLO (MOCK)
// ==========================================
const mockUser: User = { nome: 'Carlos Silva', perfil: 'gestor' };
const mockPDV: PDV = { id: 1, nome: 'Restaurante Central', codigo: 'PDV-001' };
const mockChecklist: Checklist = {
  nome: 'Checklist Diário de Operações',
  abas: [
    {
      id: 101,
      nome: 'Abertura do PDV',
      tarefas: [
        { id: 1, categoria: 'Higiene', descricao: 'Verificar limpeza do ambiente e pisos', obrigatoria: true },
        { id: 2, categoria: 'Equipamentos', descricao: 'Verificar funcionamento dos refrigeradores', obrigatoria: true },
        { id: 3, categoria: 'Organização', descricao: 'Verificar organização das mesas e salão', obrigatoria: false },
      ],
    },
    {
      id: 102,
      nome: 'Atendimento e Exposição',
      tarefas: [
        { id: 4, categoria: 'Estoque', descricao: 'Verificar reposição de insumos no balcão', obrigatoria: true },
        { id: 5, categoria: 'Segurança', descricao: 'Conferir EPIs da equipe operacional', obrigatoria: true },
      ],
    },
  ],
};

const mockCasos = [
  {
    id: 'NC-83921',
    pdv: 'PDV 01 - Centro',
    area: 'Abertura / Equipamentos',
    descricao: 'Geladeira de bebidas com temperatura acima do limite (12°C).',
    prioridade: 'CRÍTICA',
    status: 'EM TRATAMENTO',
  },
  {
    id: 'NC-83922',
    pdv: 'PDV 03 - Shopping',
    area: 'Atendimento / Limpeza',
    descricao: 'Ausência de lixeiras padronizadas no salão.',
    prioridade: 'MÉDIA',
    status: 'ABERTO',
  },
];

// ==========================================
// COMPONENTE PRINCIPAL (PAGE)
// ==========================================
export default function Page() {
  const [visao, setVisao] = useState<'colaborador' | 'gestor' | 'dashboard'>('colaborador');
  const [abaAtiva, setAbaAtiva] = useState<number>(0);
  const [respostas, setRespostas] = useState<RespostaState>({});
  const [modalNC, setModalNC] = useState<{ aberto: boolean; tarefaId: number | null }>({ aberto: false, tarefaId: null });
  const [detalhesNC, setDetalhesNC] = useState({ descricao: '', prioridade: 'MEDIA' });

  // Handlers para execução de checklist
  const handleCheckboxChange = (tarefaId: number, statusConforme: boolean) => {
    setRespostas((prev) => ({
      ...prev,
      [tarefaId]: { ...prev[tarefaId], conforme: statusConforme },
    }));

    if (!statusConforme) {
      setModalNC({ aberto: true, tarefaId });
    }
  };

  const handleSalvarCasoNC = () => {
    if (modalNC.tarefaId !== null) {
      setRespostas((prev) => ({
        ...prev,
        [modalNC.tarefaId as number]: {
          ...prev[modalNC.tarefaId as number],
          casoAberto: true,
          ncDetalhes: detalhesNC,
        },
      }));
    }
    setModalNC({ aberto: false, tarefaId: null });
    setDetalhesNC({ descricao: '', prioridade: 'MEDIA' });
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem' }}>
      {/* CSS de Impressão Integrado */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #fff !important; padding: 0 !important; }
          .card-print { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      {/* Barra Suprior de Alternância de Visão */}
      <header className="no-print" style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            Sistema de Operacionais, Conformidades e PDVs
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            Usuário: <strong>{mockUser.nome}</strong> ({mockUser.perfil})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setVisao('colaborador')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: visao === 'colaborador' ? '#2563eb' : '#e5e7eb',
              color: visao === 'colaborador' ? '#fff' : '#374151',
            }}
          >
            Área do Colaborador
          </button>
          <button
            onClick={() => setVisao('gestor')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: visao === 'gestor' ? '#2563eb' : '#e5e7eb',
              color: visao === 'gestor' ? '#fff' : '#374151',
            }}
          >
            Central de Casos
          </button>
          <button
            onClick={() => setVisao('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: visao === 'dashboard' ? '#2563eb' : '#e5e7eb',
              color: visao === 'dashboard' ? '#fff' : '#374151',
            }}
          >
            Dashboard / KPIs
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 1. VISÃO DO COLABORADOR                              */}
      {/* ==================================================== */}
      {visao === 'colaborador' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: 0, color: '#1f2937' }}>Execução de Checklist</h2>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563', display: 'flex', gap: '1.5rem' }}>
              <span><strong>PDV:</strong> {mockPDV.nome}</span>
              <span><strong>Checklist:</strong> {mockChecklist.nome}</span>
            </div>
          </div>

          {/* Abas */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#fff', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            {mockChecklist.abas.map((aba, index) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(index)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: abaAtiva === index ? '#2563eb' : '#6b7280',
                  borderBottom: abaAtiva === index ? '3px solid #2563eb' : 'none',
                }}
              >
                {aba.nome}
              </button>
            ))}
          </div>

          {/* Lista de Tarefas */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {mockChecklist.abas[abaAtiva].tarefas.map((tarefa) => {
              const resp = respostas[tarefa.id] || {};
              return (
                <div
                  key={tarefa.id}
                  style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                      {tarefa.categoria}
                    </span>
                    <span style={{ fontWeight: '500', color: '#111827' }}>{tarefa.descricao}</span>
                    {tarefa.obrigatoria && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginLeft: '0.25rem' }}>*</span>}
                    {resp.casoAberto && (
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem', fontWeight: 'bold' }}>
                        Ocorrência registrada: {resp.ncDetalhes?.descricao}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCheckboxChange(tarefa.id, true)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #16a34a',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        backgroundColor: resp.conforme === true ? '#16a34a' : '#fff',
                        color: resp.conforme === true ? '#fff' : '#16a34a',
                      }}
                    >
                      ✓ Conforme
                    </button>
                    <button
                      onClick={() => handleCheckboxChange(tarefa.id, false)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px solid #dc2626',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        backgroundColor: resp.conforme === false ? '#dc2626' : '#fff',
                        color: resp.conforme === false ? '#fff' : '#dc2626',
                      }}
                    >
                      ✕ Não Conforme
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Finalizar Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Não Conformidade */}
      {modalNC.aberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '450px', width: '100%', margin: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Registrar Não Conformidade / Caso
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#374151' }}>
                Descrição da Ocorrência
              </label>
              <textarea
                rows={3}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                value={detalhesNC.descricao}
                onChange={(e) => setDetalhesNC({ ...detalhesNC, descricao: e.target.value })}
                placeholder="Informe os detalhes do problema..."
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem', color: '#374151' }}>
                Prioridade
              </label>
              <select
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                value={detalhesNC.prioridade}
                onChange={(e) => setDetalhesNC({ ...detalhesNC, prioridade: e.target.value })}
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setModalNC({ aberto: false, tarefaId: null })}
                style={{ padding: '0.5rem 1rem', border: 'none', background: '#e5e7eb', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarCasoNC}
                style={{ padding: '0.5rem 1rem', border: 'none', background: '#dc2626', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Abrir Caso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. CENTRAL DE CASOS (GESTOR)                         */}
      {/* ==================================================== */}
      {visao === 'gestor' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ color: '#111827', marginBottom: '1rem' }}>Central de Ocorrências e Casos</h2>

          {/* Cards Sintéticos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #dc2626', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>CASOS CRÍTICOS</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>1</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>EM TRATAMENTO</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>1</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>ENCERRADOS HOJE</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>5</p>
            </div>
          </div>

          {/* Tabela de Casos */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>Caso</th>
                  <th style={{ padding: '0.75rem 1rem' }}>PDV / Área</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Descrição</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Prioridade</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {mockCasos.map((caso) => (
                  <tr key={caso.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#2563eb' }}>{caso.id}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{caso.pdv}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{caso.area}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>{caso.descricao}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: caso.prioridade === 'CRÍTICA' ? '#fee2e2' : '#fef3c7', color: caso.prioridade === 'CRÍTICA' ? '#dc2626' : '#d97706' }}>
                        {caso.prioridade}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                        {caso.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Tratar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. DASHBOARD ANALÍTICO E KPIS                        */}
      {/* ==================================================== */}
      {visao === 'dashboard' && (
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#111827', margin: 0 }}>Dashboard de Desempenho Operacional</h2>
            <button
              onClick={() => window.print()}
              className="no-print"
              style={{ padding: '0.5rem 1rem', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🖨️ Imprimir / Exportar PDF
            </button>
          </div>

          {/* Cards de KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="card-print" style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>ÍNDICE CONFORMIDADE</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>94.8%</p>
            </div>
            <div className="card-print" style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>NÃO CONFORMIDADES</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>5.2%</p>
            </div>
            <div className="card-print" style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>TAXA DE CONCLUSÃO</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>98.1%</p>
            </div>
            <div className="card-print" style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' }}>TEMPO MÉDIO RESOLUÇÃO</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#9333ea' }}>2.4h</p>
            </div>
          </div>

          {/* Tabela de Ranking de PDVs */}
          <div className="card-print" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Ranking Comparativo de PDVs</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '0.5rem 1rem' }}>Posição</th>
                  <th style={{ padding: '0.5rem 1rem' }}>PDV</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Conformidade</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Não Conformidade</th>
                  <th style={{ padding: '0.5rem 1rem' }}>Checklists Concluídos</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#d97706' }}>1º</td>
                  <td style={{ padding: '0.5rem 1rem' }}>PDV 04 - Zona Leste</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#16a34a' }}>99.2%</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#dc2626' }}>0.8%</td>
                  <td style={{ padding: '0.5rem 1rem' }}>100%</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#4b5563' }}>2º</td>
                  <td style={{ padding: '0.5rem 1rem' }}>PDV 01 - Centro Principal</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#16a34a' }}>96.5%</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#dc2626' }}>3.5%</td>
                  <td style={{ padding: '0.5rem 1rem' }}>100%</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#b45309' }}>3º</td>
                  <td style={{ padding: '0.5rem 1rem' }}>PDV 02 - Shopping Norte</td>
                  <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold', color: '#16a34a' }}>91.0%</td>
                  <td style={{ padding: '0.5rem 1rem', color: '#dc2626' }}>9.0%</td>
                  <td style={{ padding: '0.5rem 1rem' }}>94%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
