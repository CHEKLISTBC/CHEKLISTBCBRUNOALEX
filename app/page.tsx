"use client";

import React, { useState } from "react";

// TIPO PARA USUÁRIOS
interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: "colaborador" | "gestor" | "administrador";
  pdvId: string;
}

// TIPO PARA PDVs
interface PDV {
  id: string;
  nome: string;
  codigo: string;
  gestor: string;
  status: string;
}

// TIPO PARA TAREFAS E CHECKLISTS
interface Tarefa {
  id: number;
  descricao: string;
  obrigatoria: boolean;
}

interface ChecklistTemplate {
  id: string;
  nome: string;
  periodicidade: string;
  tarefas: Tarefa[];
}

export default function App() {
  // 1. PERFIL ATIVO NO SISTEMA
  const [role, setRole] = useState<"colaborador" | "gestor" | "administrador">("administrador");
  const [activeTab, setActiveTab] = useState<"checklist" | "casos" | "kpis" | "gestao_pdv" | "gestao_checklists" | "gestao_usuarios">("checklist");

  // 2. LISTA COMPLETA DE PDVs (Padrão + Extensível)
  const [pdvs, setPdvs] = useState<PDV[]>([
    { id: "1", nome: "Caipiródromo", codigo: "PDV-001", gestor: "Carlos Silva", status: "Ativo" },
    { id: "2", nome: "Bar Central", codigo: "PDV-002", gestor: "Mariana Souza", status: "Ativo" },
    { id: "3", nome: "Restaurante Principal", codigo: "PDV-003", gestor: "Roberto Alves", status: "Ativo" },
    { id: "4", nome: "Villa Sertaneja", codigo: "PDV-004", gestor: "Carlos Silva", status: "Ativo" },
    { id: "5", nome: "Quiosque de Sucos", codigo: "PDV-005", gestor: "Mariana Souza", status: "Ativo" },
    { id: "6", nome: "Loja de Souvenirs", codigo: "PDV-006", gestor: "Roberto Alves", status: "Ativo" },
    { id: "7", nome: "Praça de Alimentação 2", codigo: "PDV-007", gestor: "Carlos Silva", status: "Ativo" },
  ]);
  const [novoPdvNome, setNovoPdvNome] = useState("");
  const [novoPdvCodigo, setNovoPdvCodigo] = useState("");

  // 3. LISTA DE USUÁRIOS E COLABORADORES
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: "usr-1", nome: "João Operador", email: "joao@fazenda.com", cargo: "Atendente", perfil: "colaborador", pdvId: "1" },
    { id: "usr-2", nome: "Maria Auxiliar", email: "maria@fazenda.com", cargo: "Auxiliar de Cozinha", perfil: "colaborador", pdvId: "3" },
    { id: "usr-3", nome: "Carlos Silva", email: "carlos@fazenda.com", cargo: "Gestor de Operações", perfil: "gestor", pdvId: "1" },
  ]);
  const [novoUsrNome, setNovoUsrNome] = useState("");
  const [novoUsrEmail, setNovoUsrEmail] = useState("");
  const [novoUsrCargo, setNovoUsrCargo] = useState("");
  const [novoUsrPerfil, setNovoUsrPerfil] = useState<"colaborador" | "gestor" | "administrador">("colaborador");
  const [novoUsrPdv, setNovoUsrPdv] = useState("1");

  // 4. MODELOS DE CHECKLISTS E SUAS TAREFAS
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([
    {
      id: "chk-1",
      nome: "Checklist de Abertura do PDV",
      periodicidade: "Diário (Abertura)",
      tarefas: [
        { id: 1, descricao: "Layout organizado e limpo", obrigatoria: true },
        { id: 2, descricao: "Balcões limpos e higienizados", obrigatoria: true },
        { id: 3, descricao: "Verificar freezers e geladeiras ligados", obrigatoria: true },
        { id: 4, descricao: "Geladeiras abastecidas e organizadas", obrigatoria: true },
        { id: 5, descricao: "Utensílios da mise en place disponíveis", obrigatoria: true },
      ]
    },
    {
      id: "chk-2",
      nome: "Checklist de Fechamento do PDV",
      periodicidade: "Diário (Fechamento)",
      tarefas: [
        { id: 101, descricao: "Conferência de caixa e sangrias efetuadas", obrigatoria: true },
        { id: 102, descricao: "Lixo retirado e lixeiras higienizadas", obrigatoria: true },
        { id: 103, descricao: "Equipamentos elétricos e luzes desligadas", obrigatoria: true },
        { id: 104, descricao: "Fechamento de portas, janelas e trancas", obrigatoria: true },
      ]
    }
  ]);

  // Estados de Edição de Checklist
  const [checklistSelecionadoId, setChecklistSelecionadoId] = useState<string>("chk-1");
  const [novoChecklistNome, setNovoChecklistNome] = useState("");
  const [novoChecklistFreq, setNovoChecklistFreq] = useState("Diário");
  const [novaTarefaDesc, setNovaTarefaDesc] = useState("");
  const [editandoTarefaId, setEditandoTarefaId] = useState<number | null>(null);
  const [textoEdicaoTarefa, setTextoEdicaoTarefa] = useState("");

  // 5. ESTADO DA EXECUÇÃO DO CHECKLIST
  const [pdvExecucao, setPdvExecucao] = useState("Caipiródromo");
  const [colaboradorExecucao, setColaboradorExecucao] = useState<string>(usuarios[0]?.nome || "");
  const [respostas, setRespostas] = useState<{ [key: number]: "Conforme" | "Não Conforme" | "N/A" }>({});

  // 6. CASOS E NÃO CONFORMIDADES
  const [casos, setCasos] = useState<any[]>([
    {
      id: "NC-1001",
      pdv: "Caipiródromo",
      tarefa: "Verificar freezers e geladeiras ligados",
      descricao: "Freezer desligado na tomada principal.",
      prioridade: "Alta",
      status: "Em tratamento",
      abertoPor: "João Operador",
      gestor: "Carlos Silva",
      data: "2026-08-26 18:30"
    }
  ]);
  const [modalCaso, setModalCaso] = useState<{ aberto: boolean; tarefaId: number | null }>({ aberto: false, tarefaId: null });
  const [descricaoCaso, setDescricaoCaso] = useState("");
  const [prioridadeCaso, setPrioridadeCaso] = useState("Média");

  // --- FUNÇÕES DE AÇÃO ---

  // Gerenciamento de PDVs
  const handleAdicionarPdv = () => {
    if (!novoPdvNome || !novoPdvCodigo) return;
    const novo: PDV = {
      id: String(pdvs.length + 1),
      nome: novoPdvNome,
      codigo: novoPdvCodigo,
      gestor: "Gestor Geral",
      status: "Ativo"
    };
    setPdvs([...pdvs, novo]);
    setNovoPdvNome("");
    setNovoPdvCodigo("");
  };

  // Gerenciamento de Usuários
  const handleAdicionarUsuario = () => {
    if (!novoUsrNome || !novoUsrEmail) return;
    const novo: Usuario = {
      id: `usr-${usuarios.length + 1}`,
      nome: novoUsrNome,
      email: novoUsrEmail,
      cargo: novoUsrCargo || "Colaborador",
      perfil: novoUsrPerfil,
      pdvId: novoUsrPdv
    };
    setUsuarios([...usuarios, novo]);
    setNovoUsrNome("");
    setNovoUsrEmail("");
    setNovoUsrCargo("");
  };

  // Gerenciamento de Checklists
  const handleCriarChecklist = () => {
    if (!novoChecklistNome) return;
    const novo: ChecklistTemplate = {
      id: `chk-${checklists.length + 1}`,
      nome: novoChecklistNome,
      periodicidade: novoChecklistFreq,
      tarefas: []
    };
    setChecklists([...checklists, novo]);
    setChecklistSelecionadoId(novo.id);
    setNovoChecklistNome("");
  };

  const handleAdicionarTarefa = () => {
    if (!novaTarefaDesc) return;
    const atualizado = checklists.map(chk => {
      if (chk.id === checklistSelecionadoId) {
        return {
          ...chk,
          tarefas: [...chk.tarefas, { id: Date.now(), descricao: novaTarefaDesc, obrigatoria: true }]
        };
      }
      return chk;
    });
    setChecklists(atualizado);
    setNovaTarefaDesc("");
  };

  const handleSalvarEdicaoTarefa = (tarefaId: number) => {
    const atualizado = checklists.map(chk => {
      if (chk.id === checklistSelecionadoId) {
        return {
          ...chk,
          tarefas: chk.tarefas.map(t => t.id === tarefaId ? { ...t, descricao: textoEdicaoTarefa } : t)
        };
      }
      return chk;
    });
    setChecklists(atualizado);
    setEditandoTarefaId(null);
    setTextoEdicaoTarefa("");
  };

  const handleExcluirTarefa = (tarefaId: number) => {
    const atualizado = checklists.map(chk => {
      if (chk.id === checklistSelecionadoId) {
        return {
          ...chk,
          tarefas: chk.tarefas.filter(t => t.id !== tarefaId)
        };
      }
      return chk;
    });
    setChecklists(atualizado);
  };

  // Execução e Respostas
  const handleResposta = (itemId: number, status: "Conforme" | "Não Conforme" | "N/A") => {
    setRespostas(prev => ({ ...prev, [itemId]: status }));
    if (status === "Não Conforme") {
      setModalCaso({ aberto: true, tarefaId: itemId });
    }
  };

  const handleSalvarCaso = () => {
    if (!modalCaso.tarefaId) return;
    const currentChk = checklists.find(c => c.id === checklistSelecionadoId);
    const item = currentChk?.tarefas.find(i => i.id === modalCaso.tarefaId);

    const novo = {
      id: `NC-${1000 + casos.length + 1}`,
      pdv: pdvExecucao,
      tarefa: item?.descricao || "Geral",
      descricao: descricaoCaso,
      prioridade: prioridadeCaso,
      status: "Aberto",
      abertoPor: colaboradorExecucao || "Colaborador",
      gestor: "Carlos Silva",
      data: new Date().toLocaleString("pt-BR")
    };
    setCasos([novo, ...casos]);
    setModalCaso({ aberto: false, tarefaId: null });
    setDescricaoCaso("");
  };

  const checklistAtivo = checklists.find(c => c.id === checklistSelecionadoId) || checklists[0];

  return (
    <div style={{ backgroundColor: "#120a05", color: "#f4eae1", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      
      {/* BARRA SUPERIOR E PERFIL */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a3d13", paddingBottom: "15px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#d4af37", fontSize: "24px" }}>🤠 Gestão Operacional de PDVs e Checklists</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#a8927a" }}>Controle Diário, Conformidades e Auditoria</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px" }}>Perfil Ativo:</span>
          <button onClick={() => setRole("colaborador")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "colaborador" ? "#d4af37" : "#211209", color: role === "colaborador" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Colaborador</button>
          <button onClick={() => setRole("gestor")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "gestor" ? "#d4af37" : "#211209", color: role === "gestor" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Gestor</button>
          <button onClick={() => setRole("administrador")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "administrador" ? "#d4af37" : "#211209", color: role === "administrador" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Admin</button>
        </div>
      </header>

      {/* MENU DE NAVEGAÇÃO PRINCIPAL */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("checklist")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "checklist" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
          📋 Executar Checklist
        </button>

        {(role === "gestor" || role === "administrador") && (
          <>
            <button onClick={() => setActiveTab("gestao_checklists")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #d4af37", backgroundColor: activeTab === "gestao_checklists" ? "#d4af37" : "#211209", color: activeTab === "gestao_checklists" ? "#120a05" : "#d4af37", fontWeight: "bold", cursor: "pointer" }}>
              ✏️ Gerenciar Checklists
            </button>
            <button onClick={() => setActiveTab("casos")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "casos" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
              🚨 Central de Casos ({casos.filter(c => c.status !== "Encerrado").length})
            </button>
            <button onClick={() => setActiveTab("kpis")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "kpis" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
              📊 KPIs e Relatórios
            </button>
          </>
        )}

        {role === "administrador" && (
          <>
            <button onClick={() => setActiveTab("gestao_pdv")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "gestao_pdv" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
              📍 Cadastrar PDVs ({pdvs.length})
            </button>
            <button onClick={() => setActiveTab("gestao_usuarios")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "gestao_usuarios" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
              👥 Cadastrar Usuários ({usuarios.length})
            </button>
          </>
        )}
      </nav>

      {/* 1. EXECUÇÃO DO CHECKLIST COM IDENTIFICAÇÃO DO COLABORADOR */}
      {activeTab === "checklist" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📋 Preenchimento Operacional do Checklist</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px", backgroundColor: "#211209", padding: "15px", borderRadius: "6px", border: "1px solid #3d200f" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>1. Quem está preenchendo? (Colaborador)*</label>
              <select value={colaboradorExecucao} onChange={(e) => setColaboradorExecucao(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {usuarios.map(u => <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>2. Selecionar PDV*</label>
              <select value={pdvExecucao} onChange={(e) => setPdvExecucao(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {pdvs.map(p => <option key={p.id} value={p.nome}>{p.codigo} - {p.nome}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>3. Checklist a Executar*</label>
              <select value={checklistSelecionadoId} onChange={(e) => setChecklistSelecionadoId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {checklists.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ color: "#d4af37", borderBottom: "1px solid #7a3d13", paddingBottom: "5px" }}>{checklistAtivo.nome}</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {checklistAtivo.tarefas.length === 0 ? (
              <p style={{ color: "#a8927a" }}>Nenhuma tarefa cadastrada neste checklist ainda. Acesse a aba "Gerenciar Checklists" para incluir perguntas.</p>
            ) : (
              checklistAtivo.tarefas.map(item => (
                <div key={item.id} style={{ backgroundColor: "#211209", padding: "12px 15px", borderRadius: "6px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <strong>{item.descricao}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <label style={{ cursor: "pointer" }}>
                      <input type="radio" name={`chk-${item.id}`} onChange={() => handleResposta(item.id, "Conforme")} checked={respostas[item.id] === "Conforme"} /> Conforme
                    </label>
                    <label style={{ cursor: "pointer", color: "#ff6b6b" }}>
                      <input type="radio" name={`chk-${item.id}`} onChange={() => handleResposta(item.id, "Não Conforme")} checked={respostas[item.id] === "Não Conforme"} /> NÃO Conforme
                    </label>
                    <label style={{ cursor: "pointer" }}>
                      <input type="radio" name={`chk-${item.id}`} onChange={() => handleResposta(item.id, "N/A")} checked={respostas[item.id] === "N/A"} /> N/A
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>

          {checklistAtivo.tarefas.length > 0 && (
            <button 
              onClick={() => alert(`Checklist registrado com sucesso por ${colaboradorExecucao} no ${pdvExecucao}!`)}
              style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
              Finalizar e Gravar Checklist
            </button>
          )}
        </main>
      )}

      {/* 2. MÓDULO DE GERENCIAMENTO E EDIÇÃO DE CHECKLISTS */}
      {activeTab === "gestao_checklists" && (
        <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>➕ Criar Novo Modelo de Checklist</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input type="text" placeholder="Nome do Checklist (Ex: Auditoria de Estoque)" value={novoChecklistNome} onChange={(e) => setNovoChecklistNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 2 }} />
              <input type="text" placeholder="Frequência (Ex: Semanal)" value={novoChecklistFreq} onChange={(e) => setNovoChecklistFreq(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
              <button onClick={handleCriarChecklist} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+ Cadastrar Checklist</button>
            </div>
          </section>

          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>✏️ Editar Tarefas do Checklist Selecionado</h2>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Selecione o Checklist para alterar:</label>
              <select value={checklistSelecionadoId} onChange={(e) => setChecklistSelecionadoId(e.target.value)} style={{ padding: "8px", backgroundColor: "#211209", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", width: "100%", maxWidth: "400px" }}>
                {checklists.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.periodicidade})</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input type="text" placeholder="Digite uma nova pergunta/tarefa para este checklist..." value={novaTarefaDesc} onChange={(e) => setNovaTarefaDesc(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
              <button onClick={handleAdicionarTarefa} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+ Incluir Tarefa</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {checklistAtivo.tarefas.map(t => (
                <div key={t.id} style={{ padding: "10px", backgroundColor: "#211209", borderRadius: "4px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {editandoTarefaId === t.id ? (
                    <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                      <input type="text" value={textoEdicaoTarefa} onChange={(e) => setTextoEdicaoTarefa(e.target.value)} style={{ padding: "5px", borderRadius: "4px", border: "1px solid #d4af37", backgroundColor: "#120a05", color: "#fff", flex: 1 }} />
                      <button onClick={() => handleSalvarEdicaoTarefa(t.id)} style={{ padding: "5px 10px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Salvar</button>
                      <button onClick={() => setEditandoTarefaId(null)} style={{ padding: "5px 10px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <span>• {t.descricao}</span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => { setEditandoTarefaId(t.id); setTextoEdicaoTarefa(t.descricao); }} style={{ padding: "4px 8px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Alterar</button>
                        <button onClick={() => handleExcluirTarefa(t.id)} style={{ padding: "4px 8px", backgroundColor: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Apagar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* 3. MÓDULO DE CADASTRO DE USUÁRIOS E COLABORADORES */}
      {activeTab === "gestao_usuarios" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>👥 Cadastro de Colaboradores e Gestores</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
            <input type="text" placeholder="Nome Completo" value={novoUsrNome} onChange={(e) => setNovoUsrNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <input type="email" placeholder="E-mail" value={novoUsrEmail} onChange={(e) => setNovoUsrEmail(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <input type="text" placeholder="Cargo (Ex: Atendente)" value={novoUsrCargo} onChange={(e) => setNovoUsrCargo(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <select value={novoUsrPerfil} onChange={(e: any) => setNovoUsrPerfil(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }}>
              <option value="colaborador">Colaborador</option>
              <option value="gestor">Gestor</option>
              <option value="administrador">Administrador</option>
            </select>
            <select value={novoUsrPdv} onChange={(e) => setNovoUsrPdv(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }}>
              {pdvs.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <button onClick={handleAdicionarUsuario} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginBottom: "20px" }}>+ Cadastrar Usuário</button>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "8px" }}>Nome</th>
                <th style={{ padding: "8px" }}>E-mail</th>
                <th style={{ padding: "8px" }}>Cargo</th>
                <th style={{ padding: "8px" }}>Perfil</th>
                <th style={{ padding: "8px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "8px" }}><strong>{u.nome}</strong></td>
                  <td style={{ padding: "8px" }}>{u.email}</td>
                  <td style={{ padding: "8px" }}>{u.cargo}</td>
                  <td style={{ padding: "8px" }}><span style={{ color: "#d4af37" }}>{u.perfil}</span></td>
                  <td style={{ padding: "8px" }}>
                    <button onClick={() => setUsuarios(usuarios.filter(x => x.id !== u.id))} style={{ padding: "4px 8px", backgroundColor: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* 4. MÓDULO DE CADASTRO DE PDVS */}
      {activeTab === "gestao_pdv" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📍 Gerenciamento e Cadastro de PDVs</h2>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input type="text" placeholder="Nome do Novo PDV" value={novoPdvNome} onChange={(e) => setNovoPdvNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
            <input type="text" placeholder="Código (Ex: PDV-008)" value={novoPdvCodigo} onChange={(e) => setNovoPdvCodigo(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", width: "150px" }} />
            <button onClick={handleAdicionarPdv} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+ Adicionar PDV</button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "8px" }}>Código</th>
                <th style={{ padding: "8px" }}>Nome do PDV</th>
                <th style={{ padding: "8px" }}>Gestor Responsável</th>
                <th style={{ padding: "8px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pdvs.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "8px" }}>{p.codigo}</td>
                  <td style={{ padding: "8px" }}><strong>{p.nome}</strong></td>
                  <td style={{ padding: "8px" }}>{p.gestor}</td>
                  <td style={{ padding: "8px" }}>
                    <button onClick={() => setPdvs(pdvs.filter(x => x.id !== p.id))} style={{ padding: "4px 8px", backgroundColor: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Inativar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* 5. CENTRAL DE CASOS E NÃO CONFORMIDADES */}
      {activeTab === "casos" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Central de Casos e Chamados</h2>
          
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "8px" }}>Código</th>
                <th style={{ padding: "8px" }}>PDV</th>
                <th style={{ padding: "8px" }}>Ocorrência</th>
                <th style={{ padding: "8px" }}>Aberto Por (Colaborador)</th>
                <th style={{ padding: "8px" }}>Prioridade</th>
                <th style={{ padding: "8px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {casos.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "8px" }}><strong>{c.id}</strong></td>
                  <td style={{ padding: "8px" }}>{c.pdv}</td>
                  <td style={{ padding: "8px" }}>
                    <div><strong>{c.tarefa}</strong></div>
                    <small style={{ color: "#a8927a" }}>{c.descricao}</small>
                  </td>
                  <td style={{ padding: "8px" }}>{c.abertoPor}</td>
                  <td style={{ padding: "8px", color: c.prioridade === "Alta" ? "#ff6b6b" : "#d4af37" }}>{c.prioridade}</td>
                  <td style={{ padding: "8px" }}>
                    <button onClick={() => setCasos(casos.map(x => x.id === c.id ? { ...x, status: "Encerrado" } : x))} style={{ padding: "4px 8px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Encerrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* 6. KPIS E RELATÓRIOS */}
      {activeTab === "kpis" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📊 Relatórios e Indicadores</h2>
          <p>Índice Geral de Conformidade: <strong style={{ color: "#2e7d32" }}>96.2%</strong></p>
          <button onClick={() => window.print()} style={{ padding: "8px 15px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Imprimir / Gerar PDF</button>
        </main>
      )}

      {/* MODAL DE CASO AUTOMÁTICO */}
      {modalCaso.aberto && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#211209", padding: "20px", borderRadius: "8px", border: "2px solid #d4af37", maxWidth: "450px", width: "100%" }}>
            <h3 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Registrar Não Conformidade</h3>
            <p style={{ fontSize: "13px" }}>Aberto por: <strong>{colaboradorExecucao}</strong> no PDV <strong>{pdvExecucao}</strong></p>
            
            <textarea rows={3} value={descricaoCaso} onChange={(e) => setDescricaoCaso(e.target.value)} placeholder="Descreva o motivo da não conformidade..." style={{ width: "95%", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", padding: "8px", marginBottom: "10px" }} />
            
            <select value={prioridadeCaso} onChange={(e) => setPrioridadeCaso(e.target.value)} style={{ width: "100%", padding: "8px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", marginBottom: "15px" }}>
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setModalCaso({ aberto: false, tarefaId: null })} style={{ padding: "6px 12px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSalvarCaso} style={{ padding: "6px 12px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Enviar Chamado</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
