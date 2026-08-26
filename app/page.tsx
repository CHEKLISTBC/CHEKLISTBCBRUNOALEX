"use client";

import React, { useState } from "react";

// TIPOS DO SISTEMA
interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: "colaborador" | "gestor" | "administrador";
  pdvId: string;
}

interface PDV {
  id: string;
  nome: string;
  codigo: string;
  gestor: string;
  status: string;
}

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

interface Caso {
  id: string;
  pdv: string;
  tarefa: string;
  descricao: string;
  prioridade: "Baixa" | "Média" | "Alta" | "Crítica";
  status: "Aberto" | "Em Atendimento" | "Aguardando Peça/Material" | "Encerrado";
  abertoPor: string;
  responsavel: string;
  parecerTecnico: string;
  dataAbertura: string;
  dataFechamento?: string;
}

export default function App() {
  // 1. PERFIL ATIVO NO SISTEMA
  const [role, setRole] = useState<"colaborador" | "gestor" | "administrador">("administrador");
  const [activeTab, setActiveTab] = useState<"checklist" | "casos" | "kpis" | "gestao_pdv" | "gestao_checklists" | "gestao_usuarios">("casos");

  // 2. LISTA DE PDVs
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
    { id: "usr-4", nome: "Manutenção Tio Zé", email: "ze@fazenda.com", cargo: "Técnico de Manutenção", perfil: "gestor", pdvId: "1" },
  ]);
  const [novoUsrNome, setNovoUsrNome] = useState("");
  const [novoUsrEmail, setNovoUsrEmail] = useState("");
  const [novoUsrCargo, setNovoUsrCargo] = useState("");
  const [novoUsrPerfil, setNovoUsrPerfil] = useState<"colaborador" | "gestor" | "administrador">("colaborador");
  const [novoUsrPdv, setNovoUsrPdv] = useState("1");

  // 4. CHECKLISTS
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

  const [checklistSelecionadoId, setChecklistSelecionadoId] = useState<string>("chk-1");
  const [novoChecklistNome, setNovoChecklistNome] = useState("");
  const [novoChecklistFreq, setNovoChecklistFreq] = useState("Diário");
  const [novaTarefaDesc, setNovaTarefaDesc] = useState("");
  const [editandoTarefaId, setEditandoTarefaId] = useState<number | null>(null);
  const [textoEdicaoTarefa, setTextoEdicaoTarefa] = useState("");

  // 5. EXECUÇÃO DE CHECKLIST
  const [pdvExecucao, setPdvExecucao] = useState("Caipiródromo");
  const [colaboradorExecucao, setColaboradorExecucao] = useState<string>(usuarios[0]?.nome || "");
  const [respostas, setRespostas] = useState<{ [key: number]: "Conforme" | "Não Conforme" | "N/A" }>({});

  // 6. CENTRAL DE CASOS (COM ATENDIMENTO E FINALIZAÇÃO)
  const [casos, setCasos] = useState<Caso[]>([
    {
      id: "NC-1001",
      pdv: "Caipiródromo",
      tarefa: "Verificar freezers e geladeiras ligados",
      descricao: "Freezer desligado na tomada principal gerando refrigeração fraca.",
      prioridade: "Alta",
      status: "Em Atendimento",
      abertoPor: "João Operador",
      responsavel: "Manutenção Tio Zé",
      parecerTecnico: "Trocado o disjuntor da tomada principal.",
      dataAbertura: "26/08/2026 14:30"
    },
    {
      id: "NC-1002",
      pdv: "Restaurante Principal",
      tarefa: "Balcões limpos e higienizados",
      descricao: "Vazamento na torneira da pia auxiliar de higienização.",
      prioridade: "Média",
      status: "Aberto",
      abertoPor: "Maria Auxiliar",
      responsavel: "Não atribuído",
      parecerTecnico: "",
      dataAbertura: "26/08/2026 16:10"
    }
  ]);

  // Modais de Criação e Edição de Casos
  const [modalNovoCaso, setModalNovoCaso] = useState<{ aberto: boolean; tarefaId: number | null }>({ aberto: false, tarefaId: null });
  const [descricaoCaso, setDescricaoCaso] = useState("");
  const [prioridadeCaso, setPrioridadeCaso] = useState<"Baixa" | "Média" | "Alta" | "Crítica">("Média");

  // Estado para Edição do Caso Aberto
  const [casoEmEdicao, setCasoEmEdicao] = useState<Caso | null>(null);

  // --- FUNÇÕES DE PDV E USUÁRIOS ---
  const handleAdicionarPdv = () => {
    if (!novoPdvNome || !novoPdvCodigo) return;
    const novo: PDV = { id: String(pdvs.length + 1), nome: novoPdvNome, codigo: novoPdvCodigo, gestor: "Gestor Geral", status: "Ativo" };
    setPdvs([...pdvs, novo]);
    setNovoPdvNome(""); setNovoPdvCodigo("");
  };

  const handleAdicionarUsuario = () => {
    if (!novoUsrNome || !novoUsrEmail) return;
    const novo: Usuario = { id: `usr-${usuarios.length + 1}`, nome: novoUsrNome, email: novoUsrEmail, cargo: novoUsrCargo || "Colaborador", perfil: novoUsrPerfil, pdvId: novoUsrPdv };
    setUsuarios([...usuarios, novo]);
    setNovoUsrNome(""); setNovoUsrEmail(""); setNovoUsrCargo("");
  };

  // --- FUNÇÕES DE CHECKLIST ---
  const handleCriarChecklist = () => {
    if (!novoChecklistNome) return;
    const novo: ChecklistTemplate = { id: `chk-${checklists.length + 1}`, nome: novoChecklistNome, periodicidade: novoChecklistFreq, tarefas: [] };
    setChecklists([...checklists, novo]);
    setChecklistSelecionadoId(novo.id);
    setNovoChecklistNome("");
  };

  const handleAdicionarTarefa = () => {
    if (!novaTarefaDesc) return;
    setChecklists(checklists.map(chk => chk.id === checklistSelecionadoId ? { ...chk, tarefas: [...chk.tarefas, { id: Date.now(), descricao: novaTarefaDesc, obrigatoria: true }] } : chk));
    setNovaTarefaDesc("");
  };

  const handleSalvarEdicaoTarefa = (tarefaId: number) => {
    setChecklists(checklists.map(chk => chk.id === checklistSelecionadoId ? { ...chk, tarefas: chk.tarefas.map(t => t.id === tarefaId ? { ...t, descricao: textoEdicaoTarefa } : t) } : chk));
    setEditandoTarefaId(null); setTextoEdicaoTarefa("");
  };

  const handleExcluirTarefa = (tarefaId: number) => {
    setChecklists(checklists.map(chk => chk.id === checklistSelecionadoId ? { ...chk, tarefas: chk.tarefas.filter(t => t.id !== tarefaId) } : chk));
  };

  // --- EXECUÇÃO DO CHECKLIST ---
  const handleResposta = (itemId: number, status: "Conforme" | "Não Conforme" | "N/A") => {
    setRespostas(prev => ({ ...prev, [itemId]: status }));
    if (status === "Não Conforme") {
      setModalNovoCaso({ aberto: true, tarefaId: itemId });
    }
  };

  const handleSalvarNovoCaso = () => {
    if (!modalNovoCaso.tarefaId) return;
    const currentChk = checklists.find(c => c.id === checklistSelecionadoId);
    const item = currentChk?.tarefas.find(i => i.id === modalNovoCaso.tarefaId);

    const novo: Caso = {
      id: `NC-${1000 + casos.length + 1}`,
      pdv: pdvExecucao,
      tarefa: item?.descricao || "Ocorrência Geral",
      descricao: descricaoCaso,
      prioridade: prioridadeCaso,
      status: "Aberto",
      abertoPor: colaboradorExecucao || "Colaborador",
      responsavel: "Não atribuído",
      parecerTecnico: "",
      dataAbertura: new Date().toLocaleString("pt-BR")
    };
    setCasos([novo, ...casos]);
    setModalNovoCaso({ aberto: false, tarefaId: null });
    setDescricaoCaso("");
  };

  // --- GESTÃO E ATENDIMENTO DE CASOS ---
  const handleSalvarAtualizacaoCaso = () => {
    if (!casoEmEdicao) return;

    setCasos(casos.map(c => {
      if (c.id === casoEmEdicao.id) {
        return {
          ...casoEmEdicao,
          dataFechamento: casoEmEdicao.status === "Encerrado" ? new Date().toLocaleString("pt-BR") : c.dataFechamento
        };
      }
      return c;
    }));

    setCasoEmEdicao(null);
  };

  const checklistAtivo = checklists.find(c => c.id === checklistSelecionadoId) || checklists[0];

  return (
    <div style={{ backgroundColor: "#120a05", color: "#f4eae1", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      
      {/* TOPO / HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a3d13", paddingBottom: "15px", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#d4af37", fontSize: "24px" }}>🤠 Gestão Operacional de PDVs e Checklists</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#a8927a" }}>Controle Diário, Atendimento de Não Conformidades e KPIs</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px" }}>Simular Perfil:</span>
          <button onClick={() => setRole("colaborador")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "colaborador" ? "#d4af37" : "#211209", color: role === "colaborador" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Colaborador</button>
          <button onClick={() => setRole("gestor")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "gestor" ? "#d4af37" : "#211209", color: role === "gestor" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Gestor</button>
          <button onClick={() => setRole("administrador")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "administrador" ? "#d4af37" : "#211209", color: role === "administrador" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Admin</button>
        </div>
      </header>

      {/* MENU NAVEGAÇÃO */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("checklist")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "checklist" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
          📋 Executar Checklist
        </button>

        <button onClick={() => setActiveTab("casos")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #ff6b6b", backgroundColor: activeTab === "casos" ? "#ff6b6b" : "#211209", color: activeTab === "casos" ? "#fff" : "#ff6b6b", fontWeight: "bold", cursor: "pointer" }}>
          🚨 Central de Casos ({casos.filter(c => c.status !== "Encerrado").length})
        </button>

        {(role === "gestor" || role === "administrador") && (
          <>
            <button onClick={() => setActiveTab("gestao_checklists")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #d4af37", backgroundColor: activeTab === "gestao_checklists" ? "#d4af37" : "#211209", color: activeTab === "gestao_checklists" ? "#120a05" : "#d4af37", fontWeight: "bold", cursor: "pointer" }}>
              ✏️ Gerenciar Checklists
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

      {/* 1. CENTRAL DE CASOS COM GESTÃO COMPLETA (INICIAR, ATRIBUIR E FINALIZAR) */}
      {activeTab === "casos" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Central de Não Conformidades e Atendimento de Casos</h2>
          <p style={{ fontSize: "14px", color: "#a8927a" }}>Gerencie os chamados gerados nos checklists. Atribua um responsável, altere o status de atendimento e finalize com o parecer técnico.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginTop: "15px" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "10px" }}>Código</th>
                <th style={{ padding: "10px" }}>PDV / Ocorrência</th>
                <th style={{ padding: "10px" }}>Aberto Por</th>
                <th style={{ padding: "10px" }}>Responsável</th>
                <th style={{ padding: "10px" }}>Prioridade</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {casos.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #3d200f", backgroundColor: c.status === "Encerrado" ? "#150d07" : "transparent" }}>
                  <td style={{ padding: "10px" }}><strong>{c.id}</strong></td>
                  <td style={{ padding: "10px" }}>
                    <div><strong style={{ color: "#d4af37" }}>{c.pdv}</strong></div>
                    <div style={{ fontSize: "13px" }}>{c.tarefa}</div>
                    <small style={{ color: "#a8927a" }}>"{c.descricao}"</small>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {c.abertoPor}
                    <div style={{ fontSize: "11px", color: "#888" }}>{c.dataAbertura}</div>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ color: c.responsavel === "Não atribuído" ? "#ff6b6b" : "#fff" }}>
                      {c.responsavel}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ 
                      padding: "3px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px", 
                      fontWeight: "bold",
                      backgroundColor: c.prioridade === "Crítica" ? "#c62828" : c.prioridade === "Alta" ? "#d84315" : "#f57f17",
                      color: "#fff"
                    }}>
                      {c.prioridade}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor: c.status === "Encerrado" ? "#2e7d32" : c.status === "Em Atendimento" ? "#0288d1" : "#e65100",
                      color: "#fff"
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button 
                      onClick={() => setCasoEmEdicao(c)}
                      style={{ padding: "6px 12px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                      ⚙️ Dar Andamento / Finalizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* MODAL DE ATENDIMENTO E FINALIZAÇÃO DO CASO */}
      {casoEmEdicao && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "10px" }}>
          <div style={{ backgroundColor: "#211209", padding: "25px", borderRadius: "8px", border: "2px solid #d4af37", maxWidth: "550px", width: "100%" }}>
            <h3 style={{ color: "#d4af37", marginTop: 0, borderBottom: "1px solid #7a3d13", paddingBottom: "10px" }}>
              🛠️ Atualizar Caso: {casoEmEdicao.id} - {casoEmEdicao.pdv}
            </h3>

            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
              <p style={{ margin: "5px 0" }}><strong>Ocorrência:</strong> {casoEmEdicao.tarefa}</p>
              <p style={{ margin: "5px 0" }}><strong>Relato do Colaborador:</strong> "{casoEmEdicao.descricao}"</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#d4af37", marginBottom: "3px" }}>1. Atribuir Responsável pelo Atendimento:*</label>
                <select 
                  value={casoEmEdicao.responsavel} 
                  onChange={(e) => setCasoEmEdicao({ ...casoEmEdicao, responsavel: e.target.value })}
                  style={{ width: "100%", padding: "8px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px" }}>
                  <option value="Não atribuído">Selecione um responsável...</option>
                  {usuarios.map(u => <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#d4af37", marginBottom: "3px" }}>2. Atualizar Status do Chamado:*</label>
                <select 
                  value={casoEmEdicao.status} 
                  onChange={(e: any) => setCasoEmEdicao({ ...casoEmEdicao, status: e.target.value })}
                  style={{ width: "100%", padding: "8px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px" }}>
                  <option value="Aberto">Aberto (Aguardando Atendimento)</option>
                  <option value="Em Atendimento">Em Atendimento / Em Manutenção</option>
                  <option value="Aguardando Peça/Material">Aguardando Peça / Material</option>
                  <option value="Encerrado">Encerrado (Problema Resolvido)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#d4af37", marginBottom: "3px" }}>3. Parecer Técnico / O que foi feito:*</label>
                <textarea 
                  rows={3} 
                  value={casoEmEdicao.parecerTecnico} 
                  onChange={(e) => setCasoEmEdicao({ ...casoEmEdicao, parecerTecnico: e.target.value })}
                  placeholder="Descreva as ações tomadas para resolver o problema..." 
                  style={{ width: "95%", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", padding: "8px" }} 
                />
              </div>

            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setCasoEmEdicao(null)} style={{ padding: "8px 15px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSalvarAtualizacaoCaso} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                💾 Salvar Atualizações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXECUÇÃO DO CHECKLIST */}
      {activeTab === "checklist" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📋 Preenchimento Operacional do Checklist</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "20px", backgroundColor: "#211209", padding: "15px", borderRadius: "6px", border: "1px solid #3d200f" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>Colaborador:*</label>
              <select value={colaboradorExecucao} onChange={(e) => setColaboradorExecucao(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {usuarios.map(u => <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>PDV:*</label>
              <select value={pdvExecucao} onChange={(e) => setPdvExecucao(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {pdvs.map(p => <option key={p.id} value={p.nome}>{p.codigo} - {p.nome}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#d4af37" }}>Checklist:*</label>
              <select value={checklistSelecionadoId} onChange={(e) => setChecklistSelecionadoId(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13" }}>
                {checklists.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ color: "#d4af37", borderBottom: "1px solid #7a3d13", paddingBottom: "5px" }}>{checklistAtivo.nome}</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {checklistAtivo.tarefas.map(item => (
              <div key={item.id} style={{ backgroundColor: "#211209", padding: "12px 15px", borderRadius: "6px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1 }}><strong>{item.descricao}</strong></div>
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
            ))}
          </div>

          <button onClick={() => alert(`Checklist salvo com sucesso por ${colaboradorExecucao}!`)} style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            Finalizar e Gravar Checklist
          </button>
        </main>
      )}

      {/* 3. GERENCIAR CHECKLISTS */}
      {activeTab === "gestao_checklists" && (
        <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>➕ Criar Novo Modelo de Checklist</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input type="text" placeholder="Nome do Checklist" value={novoChecklistNome} onChange={(e) => setNovoChecklistNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 2 }} />
              <input type="text" placeholder="Frequência" value={novoChecklistFreq} onChange={(e) => setNovoChecklistFreq(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
              <button onClick={handleCriarChecklist} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+ Cadastrar Checklist</button>
            </div>
          </section>

          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>✏️ Editar Tarefas do Checklist</h2>
            <select value={checklistSelecionadoId} onChange={(e) => setChecklistSelecionadoId(e.target.value)} style={{ padding: "8px", backgroundColor: "#211209", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", marginBottom: "15px" }}>
              {checklists.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input type="text" placeholder="Digite uma nova tarefa..." value={novaTarefaDesc} onChange={(e) => setNovaTarefaDesc(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
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

      {/* 4. CADASTRO DE USUÁRIOS */}
      {activeTab === "gestao_usuarios" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>👥 Cadastro de Colaboradores e Gestores</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "15px" }}>
            <input type="text" placeholder="Nome Completo" value={novoUsrNome} onChange={(e) => setNovoUsrNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <input type="email" placeholder="E-mail" value={novoUsrEmail} onChange={(e) => setNovoUsrEmail(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <input type="text" placeholder="Cargo" value={novoUsrCargo} onChange={(e) => setNovoUsrCargo(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }} />
            <select value={novoUsrPerfil} onChange={(e: any) => setNovoUsrPerfil(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff" }}>
              <option value="colaborador">Colaborador</option>
              <option value="gestor">Gestor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <button onClick={handleAdicionarUsuario} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" }}>+ Cadastrar Usuário</button>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "8px" }}>Nome</th>
                <th style={{ padding: "8px" }}>E-mail</th>
                <th style={{ padding: "8px" }}>Cargo</th>
                <th style={{ padding: "8px" }}>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "8px" }}><strong>{u.nome}</strong></td>
                  <td style={{ padding: "8px" }}>{u.email}</td>
                  <td style={{ padding: "8px" }}>{u.cargo}</td>
                  <td style={{ padding: "8px", color: "#d4af37" }}>{u.perfil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* 5. CADASTRO DE PDVS */}
      {activeTab === "gestao_pdv" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📍 Gerenciamento de PDVs</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input type="text" placeholder="Nome do PDV" value={novoPdvNome} onChange={(e) => setNovoPdvNome(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }} />
            <input type="text" placeholder="Código" value={novoPdvCodigo} onChange={(e) => setNovoPdvCodigo(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", width: "150px" }} />
            <button onClick={handleAdicionarPdv} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>+ Adicionar PDV</button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#211209", borderBottom: "2px solid #7a3d13" }}>
                <th style={{ padding: "8px" }}>Código</th>
                <th style={{ padding: "8px" }}>Nome do PDV</th>
                <th style={{ padding: "8px" }}>Gestor</th>
              </tr>
            </thead>
            <tbody>
              {pdvs.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "8px" }}>{p.codigo}</td>
                  <td style={{ padding: "8px" }}><strong>{p.nome}</strong></td>
                  <td style={{ padding: "8px" }}>{p.gestor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* 6. KPIS */}
      {activeTab === "kpis" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📊 Relatórios e Indicadores</h2>
          <p>Índice Geral de Conformidade: <strong style={{ color: "#2e7d32" }}>96.2%</strong></p>
          <button onClick={() => window.print()} style={{ padding: "8px 15px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Imprimir Relatório</button>
        </main>
      )}

      {/* MODAL PARA ABERTURA AUTOMÁTICA DE CASO NO CHECKLIST */}
      {modalNovoCaso.aberto && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#211209", padding: "20px", borderRadius: "8px", border: "2px solid #d4af37", maxWidth: "450px", width: "100%" }}>
            <h3 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Registrar Não Conformidade</h3>
            <p style={{ fontSize: "13px" }}>Aberto por: <strong>{colaboradorExecucao}</strong> no PDV <strong>{pdvExecucao}</strong></p>
            
            <textarea rows={3} value={descricaoCaso} onChange={(e) => setDescricaoCaso(e.target.value)} placeholder="Descreva o motivo da não conformidade..." style={{ width: "95%", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", padding: "8px", marginBottom: "10px" }} />
            
            <select value={prioridadeCaso} onChange={(e: any) => setPrioridadeCaso(e.target.value)} style={{ width: "100%", padding: "8px", backgroundColor: "#120a05", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px", marginBottom: "15px" }}>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setModalNovoCaso({ aberto: false, tarefaId: null })} style={{ padding: "6px 12px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSalvarNovoCaso} style={{ padding: "6px 12px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Enviar Chamado</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
