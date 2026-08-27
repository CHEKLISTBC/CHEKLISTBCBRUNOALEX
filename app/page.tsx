'use client';

import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// INTERFACES
// ==========================================
interface User {
  id: number;
  nome: string;
  email: string;
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
  abaId: number;
}

interface Aba {
  id: number;
  nome: string;
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
// CHAVES V4 E DADOS PADRÃO
// ==========================================
const KEYS = {
  USERS: 'v4_check_app_users',
  PDVS: 'v4_check_app_pdvs',
  TAREFAS: 'v4_check_app_tarefas',
  RESPOSTAS: 'v4_check_app_respostas',
};

const defaultUsers: User[] = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos@empresa.com', perfil: 'gestor' },
  { id: 2, nome: 'Ana Souza', email: 'ana@empresa.com', perfil: 'colaborador' },
];

const defaultPDVs: PDV[] = [
  { id: 1, nome: 'Restaurante Central', codigo: 'PDV-001' },
  { id: 2, nome: 'Shopping Norte', codigo: 'PDV-002' },
];

const initialAbas: Aba[] = [
  { id: 101, nome: 'Abertura do PDV' },
  { id: 102, nome: 'Atendimento e Exposição' },
];

const defaultTarefas: Tarefa[] = [
  { id: 1, abaId: 101, categoria: 'Higiene', descricao: 'Verificar limpeza do ambiente e pisos', obrigatoria: true },
  { id: 2, abaId: 101, categoria: 'Equipamentos', descricao: 'Verificar funcionamento dos refrigeradores', obrigatoria: true },
  { id: 3, abaId: 102, categoria: 'Estoque', descricao: 'Verificar reposição de insumos no balcão', obrigatoria: true },
];

// Helper seguro para ler o localStorage sem quebrar o SSR do Next.js
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Erro ao carregar ${key}:`, e);
    return defaultValue;
  }
}

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const loadedRef = useRef(false);

  // ESTADOS INICIALIZADOS DIRETAMENTE DO STORAGE
  const [usuarios, setUsuarios] = useState<User[]>(() => getStorage(KEYS.USERS, defaultUsers));
  const [pdvs, setPdvs] = useState<PDV[]>(() => getStorage(KEYS.PDVS, defaultPDVs));
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => getStorage(KEYS.TAREFAS, defaultTarefas));
  const [respostas, setRespostas] = useState<RespostaState>(() => getStorage(KEYS.RESPOSTAS, {}));

  // Interface
  const [pdvSelecionado, setPdvSelecionado] = useState<number>(1);
  const [visao, setVisao] = useState<'colaborador' | 'gestor' | 'cadastros' | 'dashboard'>('colaborador');
  const [abaAtivaIndex, setAbaAtivaIndex] = useState<number>(0);

  // Modais e Inputs
  const [modalNC, setModalNC] = useState<{ aberto: boolean; tarefaId: number | null }>({ aberto: false, tarefaId: null });
  const [detalhesNC, setDetalhesNC] = useState({ descricao: '', prioridade: 'MEDIA' });

  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', perfil: 'colaborador' as User['perfil'] });
  const [novoPDV, setNovoPDV] = useState({ nome: '', codigo: '' });
  const [novaTarefa, setNovaTarefa] = useState({ categoria: '', descricao: '', abaId: 101, obrigatoria: true });

  // Evita erro de hidratação (Aguarde renderizar no cliente)
  useEffect(() => {
    setMounted(true);
    // Trava para indicar que os dados já foram carregados do banco local
    setTimeout(() => {
      loadedRef.current = true;
    }, 100);
  }, []);

  // SALVAMENTO AUTOMÁTICO REATIVO (Apenas após carregar/montar a tela)
  useEffect(() => {
    if (mounted && loadedRef.current) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(usuarios));
    }
  }, [usuarios, mounted]);

  useEffect(() => {
    if (mounted && loadedRef.current) {
      localStorage.setItem(KEYS.PDVS, JSON.stringify(pdvs));
    }
  }, [pdvs, mounted]);

  useEffect(() => {
    if (mounted && loadedRef.current) {
      localStorage.setItem(KEYS.TAREFAS, JSON.stringify(tarefas));
    }
  }, [tarefas, mounted]);

  useEffect(() => {
    if (mounted && loadedRef.current) {
      localStorage.setItem(KEYS.RESPOSTAS, JSON.stringify(respostas));
    }
  }, [respostas, mounted]);

  // HANDLERS
  const handleAddUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuario.nome || !novoUsuario.email) return;
    setUsuarios((prev) => [...prev, { ...novoUsuario, id: Date.now() }]);
    setNovoUsuario({ nome: '', email: '', perfil: 'colaborador' });
  };

  const handleExcluirUsuario = (id: number) => {
    if (confirm('Deseja excluir este usuário?')) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const handleAddPDV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPDV.nome || !novoPDV.codigo) return;
    setPdvs((prev) => [...prev, { ...novoPDV, id: Date.now() }]);
    setNovoPDV({ nome: '', codigo: '' });
  };

  const handleExcluirPDV = (id: number) => {
    if (confirm('Deseja excluir este PDV?')) {
      setPdvs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleAddTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTarefa.descricao || !novaTarefa.categoria) return;
    setTarefas((prev) => [...prev, { ...novaTarefa, id: Date.now(), abaId: Number(novaTarefa.abaId) }]);
    setNovaTarefa({ categoria: '', descricao: '', abaId: 101, obrigatoria: true });
  };

  const handleExcluirTarefa = (id: number) => {
    if (confirm('Deseja excluir esta tarefa?')) {
      setTarefas((prev) => prev.filter((t) => t.id !== id));
    }
  };

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
        [modalNC.tarefaId!]: {
          ...prev[modalNC.tarefaId!],
          casoAberto: true,
          ncDetalhes: detalhesNC,
        },
      }));
    }
    setModalNC({ aberto: false, tarefaId: null });
    setDetalhesNC({ descricao: '', prioridade: 'MEDIA' });
  };

  const handleResetGeral = () => {
    if (confirm('Isso excluirá todos os seus dados locais e restaurará o padrão. Confirmar?')) {
      loadedRef.current = false;
      localStorage.removeItem(KEYS.USERS);
      localStorage.removeItem(KEYS.PDVS);
      localStorage.removeItem(KEYS.TAREFAS);
      localStorage.removeItem(KEYS.RESPOSTAS);
      setUsuarios(defaultUsers);
      setPdvs(defaultPDVs);
      setTarefas(defaultTarefas);
      setRespostas({});
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        Sincronizando banco de dados local...
      </div>
    );
  }

  const abaAtual = initialAbas[abaAtivaIndex] || initialAbas[0];
  const tarefasDaAba = tarefas.filter((t) => t.abaId === abaAtual.id);
  const pdvAtualObjeto = pdvs.find((p) => p.id === pdvSelecionado) || pdvs[0];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '1.5rem' }}>
      <header style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            Sistema Integrado de Checklist
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            PDV Ativo: <strong>{pdvAtualObjeto?.nome || 'Nenhum'}</strong> ({pdvAtualObjeto?.codigo || 'N/A'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setVisao('colaborador')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: visao === 'colaborador' ? '#2563eb' : '#e5e7eb', color: visao === 'colaborador' ? '#fff' : '#374151' }}>
            Checklist
          </button>
          <button onClick={() => setVisao('gestor')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: visao === 'gestor' ? '#2563eb' : '#e5e7eb', color: visao === 'gestor' ? '#fff' : '#374151' }}>
            Central de Casos
          </button>
          <button onClick={() => setVisao('cadastros')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: visao === 'cadastros' ? '#059669' : '#e5e7eb', color: visao === 'cadastros' ? '#fff' : '#374151' }}>
            ⚙️ Cadastros
          </button>
          <button onClick={() => setVisao('dashboard')} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: visao === 'dashboard' ? '#2563eb' : '#e5e7eb', color: visao === 'dashboard' ? '#fff' : '#374151' }}>
            Dashboard
          </button>
          <button onClick={handleResetGeral} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #dc2626', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
            🔄 Zerar Banco
          </button>
        </div>
      </header>

      {/* Visão do Checklist */}
      {visao === 'colaborador' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', color: '#374151' }}>
              Selecione o PDV:
              <select value={pdvSelecionado} onChange={(e) => setPdvSelecionado(Number(e.target.value))} style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                {pdvs.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', backgroundColor: '#fff', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            {initialAbas.map((aba, index) => (
              <button key={aba.id} onClick={() => setAbaAtivaIndex(index)} style={{ padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: abaAtivaIndex === index ? '#2563eb' : '#6b7280', borderBottom: abaAtivaIndex === index ? '3px solid #2563eb' : 'none' }}>
                {aba.nome}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {tarefasDaAba.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', margin: '2rem 0' }}>Nenhuma tarefa nesta aba. Vá em "⚙️ Cadastros" para adicionar.</p>
            ) : (
              tarefasDaAba.map((tarefa) => {
                const resp = respostas[tarefa.id] || {};
                return (
                  <div key={tarefa.id} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '6px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                        {tarefa.categoria}
                      </span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{tarefa.descricao}</span>
                      {tarefa.obrigatoria && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
                      {resp.casoAberto && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem', fontWeight: 'bold' }}>
                          Ocorrência: {resp.ncDetalhes?.descricao}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleCheckboxChange(tarefa.id, true)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #16a34a', cursor: 'pointer', fontWeight: 'bold', backgroundColor: resp.conforme === true ? '#16a34a' : '#fff', color: resp.conforme === true ? '#fff' : '#16a34a' }}>
                        ✓ Conforme
                      </button>
                      <button onClick={() => handleCheckboxChange(tarefa.id, false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #dc2626', cursor: 'pointer', fontWeight: 'bold', backgroundColor: resp.conforme === false ? '#dc2626' : '#fff', color: resp.conforme === false ? '#fff' : '#dc2626' }}>
                        ✕ Não Conforme
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Cadastros */}
      {visao === 'cadastros' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
          {/* PDVs */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>📍 Gerenciar PDVs</h3>
            <form onSubmit={handleAddPDV} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nome do PDV" value={novoPDV.nome} onChange={(e) => setNovoPDV({ ...novoPDV, nome: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <input type="text" placeholder="Código (ex: PDV-003)" value={novoPDV.codigo} onChange={(e) => setNovoPDV({ ...novoPDV, codigo: e.target.value })} style={{ width: '180px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Adicionar PDV</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pdvs.map((p) => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span><strong>{p.nome}</strong> ({p.codigo})</span>
                  <button onClick={() => handleExcluirPDV(p.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarefas */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>📋 Gerenciar Tarefas do Checklist</h3>
            <form onSubmit={handleAddTarefa} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Categoria" value={novaTarefa.categoria} onChange={(e) => setNovaTarefa({ ...novaTarefa, categoria: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <input type="text" placeholder="Descrição da Tarefa" value={novaTarefa.descricao} onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <select value={novaTarefa.abaId} onChange={(e) => setNovaTarefa({ ...novaTarefa, abaId: Number(e.target.value) })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                {initialAbas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Adicionar Tarefa</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {tarefas.map((t) => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span>[{t.categoria}] {t.descricao} - <em>Aba: {initialAbas.find((a) => a.id === t.abaId)?.nome}</em></span>
                  <button onClick={() => handleExcluirTarefa(t.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Usuários */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>👥 Gerenciar Equipe / Usuários</h3>
            <form onSubmit={handleAddUsuario} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Nome" value={novoUsuario.nome} onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <input type="email" placeholder="E-mail" value={novoUsuario.email} onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }} required />
              <select value={novoUsuario.perfil} onChange={(e) => setNovoUsuario({ ...novoUsuario, perfil: e.target.value as User['perfil'] })} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                <option value="colaborador">Colaborador</option>
                <option value="gestor">Gestor</option>
                <option value="administrador">Administrador</option>
              </select>
              <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Adicionar Usuário</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {usuarios.map((u) => (
                <li key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span><strong>{u.nome}</strong> ({u.email}) - <small>{u.perfil}</small></span>
                  <button onClick={() => handleExcluirUsuario(u.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Áreas secundárias */}
      {visao === 'gestor' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Central de Ocorrências</h2>
          <p style={{ color: '#6b7280' }}>Painel de ocorrências abertas nos check-lists.</p>
        </div>
      )}

      {visao === 'dashboard' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
          <h2>Dashboard de Operações</h2>
          <p style={{ color: '#6b7280' }}>Indicadores de conformidade.</p>
        </div>
      )}

      {/* Modal Ocorrências */}
      {modalNC.aberto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', maxWidth: '450px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>⚠️ Registrar Ocorrência</h3>
            <textarea rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }} value={detalhesNC.descricao} onChange={(e) => setDetalhesNC({ ...detalhesNC, descricao: e.target.value })} placeholder="Detalhe a não conformidade..." />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => setModalNC({ aberto: false, tarefaId: null })} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSalvarCasoNC} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Ocorrência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
