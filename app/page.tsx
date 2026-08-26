"use client";

import React, { useState } from "react";

export default function App() {
  const [role, setRole] = useState<"colaborador" | "gestor" | "admin">("admin");
  const [activeTab, setActiveTab] = useState<"checklist" | "casos" | "kpis" | "gestao">("gestao");

  // 1. ESTADO DINÂMICO DE PDVS (Permite Cadastrar/Editar)
  const [pdvs, setPdvs] = useState([
    { id: "1", nome: "Caipirodromo", codigo: "PDV-001", gestor: "Carlos Silva", status: "Ativo" },
    { id: "2", nome: "Bar Central", codigo: "PDV-002", gestor: "Mariana Souza", status: "Ativo" },
    { id: "3", nome: "Restaurante Principal", codigo: "PDV-003", gestor: "Roberto Alves", status: "Ativo" }
  ]);
  const [novoPdvNome, setNovoPdvNome] = useState("");
  const [novoPdvCodigo, setNovoPdvCodigo] = useState("");

  // 2. ESTADO DINÂMICO DE CHECKLISTS E TAREFAS (Permite Cadastrar/Editar)
  const [tarefas, setTarefas] = useState([
    { id: 1, aba: "Abertura do PDV", descricao: "Layout organizado e limpo", obrigatoria: true },
    { id: 2, aba: "Abertura do PDV", descricao: "Balcões limpos e higienizados", obrigatoria: true },
    { id: 3, aba: "Abertura do PDV", descricao: "Verificar freezers e geladeiras ligados", obrigatoria: true },
    { id: 4, aba: "Abertura do PDV", descricao: "Geladeiras abastecidas e organizadas", obrigatoria: true }
  ]);
  const [novaTarefaDesc, setNovaTarefaDesc] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");

  // 3. EXECUÇÃO DE CHECKLIST E CASOS
  const [pdvSelecionado, setPdvSelecionado] = useState(pdvs[0]?.nome || "");
  const [respostas, setRespostas] = useState<{ [key: number]: "Conforme" | "Não Conforme" | "N/A" }>({});
  const [casos, setCasos] = useState<any[]>([]);

  // Funções de Gerenciamento de PDVs
  const handleAdicionarPdv = () => {
    if (!novoPdvNome || !novoPdvCodigo) return;
    const novo = {
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

  // Funções de Gerenciamento de Checklists
  const handleAdicionarTarefa = () => {
    if (!novaTarefaDesc) return;
    const nova = {
      id: tarefas.length + 1,
      aba: "Abertura do PDV",
      descricao: novaTarefaDesc,
      obrigatoria: true
    };
    setTarefas([...tarefas, nova]);
    setNovaTarefaDesc("");
  };

  const SalvarEdicaoTarefa = (id: number) => {
    setTarefas(tarefas.map(t => t.id === id ? { ...t, descricao: textoEdicao } : t));
    setEditandoId(null);
    setTextoEdicao("");
  };

  return (
    <div style={{ backgroundColor: "#120a05", color: "#f4eae1", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      
      {/* CABEÇALHO */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a3d13", paddingBottom: "15px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#d4af37", fontSize: "24px" }}>🤠 Dashboard Fazenda - Gestão Completa</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#a8927a" }}>Módulo de Gerenciamento de PDVs e Checklists</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setRole("colaborador")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "colaborador" ? "#d4af37" : "#211209", color: role === "colaborador" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Colaborador</button>
          <button onClick={() => setRole("gestor")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "gestor" ? "#d4af37" : "#211209", color: role === "gestor" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Gestor</button>
          <button onClick={() => setRole("admin")} style={{ padding: "6px 12px", border: "none", borderRadius: "4px", backgroundColor: role === "admin" ? "#d4af37" : "#211209", color: role === "admin" ? "#120a05" : "#fff", fontWeight: "bold", cursor: "pointer" }}>Admin</button>
        </div>
      </header>

      {/* MENU NAVEGAÇÃO */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("checklist")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "checklist" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
          📋 Executar Checklist
        </button>
        <button onClick={() => setActiveTab("gestao")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #d4af37", backgroundColor: activeTab === "gestao" ? "#d4af37" : "#211209", color: activeTab === "gestao" ? "#120a05" : "#d4af37", fontWeight: "bold", cursor: "pointer" }}>
          ⚙️ Gerenciar PDVs e Checklists
        </button>
        <button onClick={() => setActiveTab("casos")} style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "casos" ? "#7a3d13" : "#211209", color: "#fff", cursor: "pointer" }}>
          🚨 Central de Casos
        </button>
      </nav>

      {/* ABA DE GESTÃO: CADASTRO E EDICAO DE PDVS E CHECKLISTS */}
      {activeTab === "gestao" && (
        <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* CADASTRO DE PDVS */}
          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>📍 Módulo de PDVs (Cadastrar e Alterar)</h2>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input 
                type="text" 
                placeholder="Nome do Novo PDV" 
                value={novoPdvNome} 
                onChange={(e) => setNovoPdvNome(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }}
              />
              <input 
                type="text" 
                placeholder="Código (Ex: PDV-004)" 
                value={novoPdvCodigo} 
                onChange={(e) => setNovoPdvCodigo(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", width: "150px" }}
              />
              <button onClick={handleAdicionarPdv} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                + Adicionar PDV
              </button>
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
                      <button onClick={() => setPdvs(pdvs.filter(item => item.id !== p.id))} style={{ padding: "4px 8px", backgroundColor: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* EDITAR E CRIAR ITENS DO CHECKLIST */}
          <section style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
            <h2 style={{ color: "#d4af37", marginTop: 0 }}>📝 Editor de Checklists (Adicionar e Alterar Tarefas)</h2>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input 
                type="text" 
                placeholder="Descrição da nova tarefa do checklist..." 
                value={novaTarefaDesc} 
                onChange={(e) => setNovaTarefaDesc(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #7a3d13", backgroundColor: "#211209", color: "#fff", flex: 1 }}
              />
              <button onClick={handleAdicionarTarefa} style={{ padding: "8px 15px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                + Criar Tarefa
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tarefas.map(t => (
                <div key={t.id} style={{ padding: "10px", backgroundColor: "#211209", borderRadius: "4px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {editandoId === t.id ? (
                    <div style={{ display: "flex", gap: "10px", flex: 1 }}>
                      <input 
                        type="text" 
                        value={textoEdicao} 
                        onChange={(e) => setTextoEdicao(e.target.value)}
                        style={{ padding: "5px", borderRadius: "4px", border: "1px solid #d4af37", backgroundColor: "#120a05", color: "#fff", flex: 1 }}
                      />
                      <button onClick={() => SalvarEdicaoTarefa(t.id)} style={{ padding: "5px 10px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Salvar</button>
                      <button onClick={() => setEditandoId(null)} style={{ padding: "5px 10px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  ) : (
                    <>
                      <span>{t.id}. {t.descricao}</span>
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button onClick={() => { setEditandoId(t.id); setTextoEdicao(t.descricao); }} style={{ padding: "4px 8px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                          Alterar
                        </button>
                        <button onClick={() => setTarefas(tarefas.filter(item => item.id !== t.id))} style={{ padding: "4px 8px", backgroundColor: "#c62828", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                          Apagar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* ABA DE EXECUÇÃO DO CHECKLIST (DINÂMICO) */}
      {activeTab === "checklist" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📍 Executar Checklist Diário</h2>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ marginRight: "10px" }}>Selecione o PDV:</label>
            <select value={pdvSelecionado} onChange={(e) => setPdvSelecionado(e.target.value)} style={{ padding: "8px", backgroundColor: "#211209", color: "#fff", border: "1px solid #7a3d13", borderRadius: "4px" }}>
              {pdvs.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tarefas.map(t => (
              <div key={t.id} style={{ padding: "12px", backgroundColor: "#211209", borderRadius: "6px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>{t.id}.</strong> {t.descricao}</span>
                <div style={{ display: "flex", gap: "10px" }}>
                  <label><input type="radio" name={`check-${t.id}`} /> Conforme</label>
                  <label style={{ color: "#ff6b6b" }}><input type="radio" name={`check-${t.id}`} /> Não Conforme</label>
                  <label><input type="radio" name={`check-${t.id}`} /> N/A</label>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ABA CENTRAL DE CASOS */}
      {activeTab === "casos" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Central de Não Conformidades</h2>
          <p>Nenhum chamado aberto pendente no momento.</p>
        </main>
      )}

    </div>
  );
}
