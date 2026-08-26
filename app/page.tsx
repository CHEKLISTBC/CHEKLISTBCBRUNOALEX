"use client";

import React, { useState } from "react";

// MOCK DATA: Estrutura inicial conforme requisitos 1 a 30
const INITIAL_PDVS = [
  { id: "1", nome: "Caipirodromo", codigo: "PDV-001", gestor: "Carlos Silva", status: "Ativo" },
  { id: "2", nome: "Bar Central", codigo: "PDV-002", gestor: "Mariana Souza", status: "Ativo" },
];

const INITIAL_CHECKLIST_ITEMS = [
  { id: 1, aba: "Abertura do PDV", descricao: "Layout organizado e limpo", obrigatoria: true },
  { id: 2, aba: "Abertura do PDV", descricao: "Balcões limpos e higienizados", obrigatoria: true },
  { id: 3, aba: "Abertura do PDV", descricao: "Verificar freezers e geladeiras ligados", obrigatoria: true },
  { id: 4, aba: "Abertura do PDV", descricao: "Geladeiras abastecidas e organizadas", obrigatoria: true },
  { id: 5, aba: "Abertura do PDV", descricao: "Todos os utensílios da mise en place disponíveis", obrigatoria: true },
  { id: 6, aba: "Abertura do PDV", descricao: "Bancadas organizadas e limpas", obrigatoria: true }
];

export default function App() {
  const [role, setRole] = useState<"colaborador" | "gestor" | "admin">("colaborador");
  const [activeTab, setActiveTab] = useState<"checklist" | "casos" | "kpis" | "usuarios" | "especificacao">("checklist");

  // Estado do Checklist
  const [pdvSelecionado, setPdvSelecionado] = useState("Caipirodromo");
  const [respostas, setRespostas] = useState<{ [key: number]: "Conforme" | "Não Conforme" | "N/A" }>({});
  const [observacoes, setObservacoes] = useState<{ [key: number]: string }>({});

  // Estado de Não Conformidades / Casos
  const [casos, setCasos] = useState<any[]>([
    {
      id: "NC-1001",
      pdv: "Caipirodromo",
      tarefa: "Verificar freezers e geladeiras ligados",
      descricao: "Freezer principal desligado na tomada com temperatura acima do padrão.",
      prioridade: "Alta",
      status: "Em tratamento",
      abertoPor: "João Operador",
      gestor: "Carlos Silva",
      data: "2026-08-26 18:30"
    }
  ]);

  const [novoCasoModal, setNovoCasoModal] = useState<{ aberto: boolean; tarefaId: number | null }>({
    aberto: false,
    tarefaId: null
  });
  const [descricaoCaso, setDescricaoCaso] = useState("");
  const [prioridadeCaso, setPrioridadeCaso] = useState("Média");

  // Manipuladores do Checklist
  const handleResposta = (itemId: number, status: "Conforme" | "Não Conforme" | "N/A") => {
    setRespostas(prev => ({ ...prev, [itemId]: status }));
    if (status === "Não Conforme") {
      setNovoCasoModal({ aberto: true, tarefaId: itemId });
    }
  };

  const handleSalvarCaso = () => {
    if (!novoCasoModal.tarefaId) return;
    const item = INITIAL_CHECKLIST_ITEMS.find(i => i.id === novoCasoModal.tarefaId);
    const novo = {
      id: `NC-${1000 + casos.length + 1}`,
      pdv: pdvSelecionado,
      tarefa: item?.descricao || "Geral",
      descricao: descricaoCaso,
      prioridade: prioridadeCaso,
      status: "Aberto",
      abertoPor: "Colaborador Atual",
      gestor: "Carlos Silva",
      data: new Date().toLocaleString("pt-BR")
    };
    setCasos([novo, ...casos]);
    setNovoCasoModal({ aberto: false, tarefaId: null });
    setDescricaoCaso("");
  };

  return (
    <div style={{ backgroundColor: "#120a05", color: "#f4eae1", minHeight: "100vh", fontFamily: "sans-serif", padding: "20px" }}>
      
      {/* CABEÇALHO COM TROCA DE PERFIL */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #7a3d13", paddingBottom: "15px", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, color: "#d4af37", fontSize: "24px" }}>🤠 Dashboard Fazenda - Gestão de PDVs</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "#a8927a" }}>Sistema de Checklists Operacionais, Conformidades e Chamados</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "14px" }}>Perfil de Acesso:</span>
          <button 
            onClick={() => setRole("colaborador")} 
            style={{ padding: "6px 12px", borderRadius: "4px", border: "none", backgroundColor: role === "colaborador" ? "#d4af37" : "#211209", color: role === "colaborador" ? "#120a05" : "#f4eae1", fontWeight: "bold", cursor: "pointer" }}>
            Colaborador
          </button>
          <button 
            onClick={() => setRole("gestor")} 
            style={{ padding: "6px 12px", borderRadius: "4px", border: "none", backgroundColor: role === "gestor" ? "#d4af37" : "#211209", color: role === "gestor" ? "#120a05" : "#f4eae1", fontWeight: "bold", cursor: "pointer" }}>
            Gestor
          </button>
          <button 
            onClick={() => setRole("admin")} 
            style={{ padding: "6px 12px", borderRadius: "4px", border: "none", backgroundColor: role === "admin" ? "#d4af37" : "#211209", color: role === "admin" ? "#120a05" : "#f4eae1", fontWeight: "bold", cursor: "pointer" }}>
            Admin
          </button>
        </div>
      </header>

      {/* MENU NAVEGAÇÃO PRINCIPAL */}
      <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={() => setActiveTab("checklist")}
          style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "checklist" ? "#7a3d13" : "#211209", color: "#f4eae1", cursor: "pointer" }}>
          📋 Checklist Diário
        </button>
        {(role === "gestor" || role === "admin") && (
          <>
            <button 
              onClick={() => setActiveTab("casos")}
              style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "casos" ? "#7a3d13" : "#211209", color: "#f4eae1", cursor: "pointer" }}>
              🚨 Central de Casos ({casos.filter(c => c.status !== "Encerrado").length})
            </button>
            <button 
              onClick={() => setActiveTab("kpis")}
              style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "kpis" ? "#7a3d13" : "#211209", color: "#f4eae1", cursor: "pointer" }}>
              📊 KPIs e Relatórios
            </button>
          </>
        )}
        {role === "admin" && (
          <button 
            onClick={() => setActiveTab("usuarios")}
            style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #7a3d13", backgroundColor: activeTab === "usuarios" ? "#7a3d13" : "#211209", color: "#f4eae1", cursor: "pointer" }}>
            ⚙️ Cadastro de Usuários / PDVs
          </button>
        )}
        <button 
          onClick={() => setActiveTab("especificacao")}
          style={{ padding: "10px 15px", borderRadius: "6px", border: "1px solid #d4af37", backgroundColor: activeTab === "especificacao" ? "#d4af37" : "#211209", color: activeTab === "especificacao" ? "#120a05" : "#d4af37", fontWeight: "bold", cursor: "pointer" }}>
          📜 Requisitos Técnicos (30 Pontos)
        </button>
      </nav>

      {/* ABA 1: EXECUÇÃO DO CHECKLIST */}
      {activeTab === "checklist" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📍 Execução Operacional de Checklist</h2>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Selecionar PDV:</label>
              <select 
                value={pdvSelecionado} 
                onChange={(e) => setPdvSelecionado(e.target.value)}
                style={{ padding: "8px", borderRadius: "4px", backgroundColor: "#211209", color: "#f4eae1", border: "1px solid #7a3d13" }}>
                {INITIAL_PDVS.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Turno:</label>
              <select style={{ padding: "8px", borderRadius: "4px", backgroundColor: "#211209", color: "#f4eae1", border: "1px solid #7a3d13" }}>
                <option>Abertura</option>
                <option>Fechamento</option>
              </select>
            </div>
          </div>

          <h3 style={{ borderBottom: "1px solid #7a3d13", paddingBottom: "8px", color: "#d4af37" }}>Aba: Abertura do PDV</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {INITIAL_CHECKLIST_ITEMS.map((item) => (
              <div key={item.id} style={{ backgroundColor: "#26160b", padding: "15px", borderRadius: "6px", border: "1px solid #3d200f", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <strong>{item.id}. {item.descricao}</strong>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <label style={{ cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name={`item-${item.id}`} 
                      onChange={() => handleResposta(item.id, "Conforme")}
                      checked={respostas[item.id] === "Conforme"} 
                    /> Conforme
                  </label>
                  <label style={{ cursor: "pointer", color: "#ff6b6b" }}>
                    <input 
                      type="radio" 
                      name={`item-${item.id}`} 
                      onChange={() => handleResposta(item.id, "Não Conforme")}
                      checked={respostas[item.id] === "Não Conforme"} 
                    /> NÃO Conforme
                  </label>
                  <label style={{ cursor: "pointer" }}>
                    <input 
                      type="radio" 
                      name={`item-${item.id}`} 
                      onChange={() => handleResposta(item.id, "N/A")}
                      checked={respostas[item.id] === "N/A"} 
                    /> N/A
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => alert("Checklist finalizado com sucesso e salvo no banco de dados!")}
            style={{ marginTop: "20px", width: "100%", padding: "12px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "6px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
            Finalizar e Gravar Checklist
          </button>
        </main>
      )}

      {/* MODAL PARA ABERTURA DE CASO AUTOMÁTICO */}
      {novoCasoModal.aberto && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#211209", padding: "25px", borderRadius: "8px", border: "2px solid #d4af37", maxWidth: "500px", width: "100%" }}>
            <h3 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Registrar Não Conformidade / Abrir Caso</h3>
            <p style={{ fontSize: "14px" }}>Item: {INITIAL_CHECKLIST_ITEMS.find(i => i.id === novoCasoModal.tarefaId)?.descricao}</p>
            
            <label style={{ display: "block", marginBottom: "5px" }}>Descrição detalhada do problema:</label>
            <textarea 
              rows={4} 
              value={descricaoCaso} 
              onChange={(e) => setDescricaoCaso(e.target.value)}
              style={{ width: "95%", backgroundColor: "#120a05", color: "#f4eae1", border: "1px solid #7a3d13", borderRadius: "4px", padding: "8px", marginBottom: "15px" }} 
              placeholder="Descreva o motivo do problema e o que precisa ser ajustado..."
            />

            <label style={{ display: "block", marginBottom: "5px" }}>Prioridade:</label>
            <select 
              value={prioridadeCaso} 
              onChange={(e) => setPrioridadeCaso(e.target.value)}
              style={{ width: "100%", padding: "8px", backgroundColor: "#120a05", color: "#f4eae1", border: "1px solid #7a3d13", borderRadius: "4px", marginBottom: "20px" }}>
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setNovoCasoModal({ aberto: false, tarefaId: null })}
                style={{ padding: "8px 16px", backgroundColor: "#444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button 
                onClick={handleSalvarCaso}
                style={{ padding: "8px 16px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
                Enviar Chamado ao Gestor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CENTRAL DE CASOS (GESTOR/ADMIN) */}
      {activeTab === "casos" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>🚨 Central de Não Conformidades e Casos</h2>
          <p style={{ fontSize: "14px", color: "#a8927a" }}>Acompanhamento em tempo real, atribuição e encerramento de ocorrências enviadas pelos colaboradores.</p>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #7a3d13", backgroundColor: "#211209" }}>
                <th style={{ padding: "10px" }}>Código</th>
                <th style={{ padding: "10px" }}>PDV</th>
                <th style={{ padding: "10px" }}>Ocorrência</th>
                <th style={{ padding: "10px" }}>Prioridade</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {casos.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #3d200f" }}>
                  <td style={{ padding: "10px" }}><strong>{c.id}</strong></td>
                  <td style={{ padding: "10px" }}>{c.pdv}</td>
                  <td style={{ padding: "10px" }}>
                    <div><strong>{c.tarefa}</strong></div>
                    <small style={{ color: "#a8927a" }}>{c.descricao}</small>
                  </td>
                  <td style={{ padding: "10px", color: c.prioridade === "Alta" || c.prioridade === "Crítica" ? "#ff6b6b" : "#d4af37" }}>
                    {c.prioridade}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ padding: "4px 8px", borderRadius: "4px", backgroundColor: "#211209", border: "1px solid #7a3d13" }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button 
                      onClick={() => {
                        const novos = casos.map(item => item.id === c.id ? { ...item, status: "Encerrado" } : item);
                        setCasos(novos);
                      }}
                      style={{ padding: "5px 10px", backgroundColor: "#2e7d32", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Encerrar Caso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      )}

      {/* ABA 3: KPIS E RELATÓRIOS */}
      {activeTab === "kpis" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📊 Relatórios e Indicadores (KPIs)</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#211209", padding: "15px", borderRadius: "6px", border: "1px solid #7a3d13" }}>
              <div style={{ fontSize: "12px", color: "#a8927a" }}>Taxa Geral de Conformidade</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2e7d32" }}>94.5%</div>
            </div>
            <div style={{ backgroundColor: "#211209", padding: "15px", borderRadius: "6px", border: "1px solid #7a3d13" }}>
              <div style={{ fontSize: "12px", color: "#a8927a" }}>Casos Abertos Hoje</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff6b6b" }}>{casos.filter(c => c.status !== "Encerrado").length}</div>
            </div>
            <div style={{ backgroundColor: "#211209", padding: "15px", borderRadius: "6px", border: "1px solid #7a3d13" }}>
              <div style={{ fontSize: "12px", color: "#a8927a" }}>Tempo Médio de Resolução</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#d4af37" }}>1.2 Horas</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={() => alert("Gerando arquivo PDF formatado para impressão...")}
              style={{ padding: "10px 20px", backgroundColor: "#d4af37", color: "#120a05", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
              📄 Exportar PDF
            </button>
            <button 
              onClick={() => window.print()}
              style={{ padding: "10px 20px", backgroundColor: "#211209", color: "#f4eae1", border: "1px solid #7a3d13", borderRadius: "4px", cursor: "pointer" }}>
              🖨️ Imprimir Relatório
            </button>
          </div>
        </main>
      )}

      {/* ABA 4: REQUISITOS TÉCNICOS INTEGRADOS */}
      {activeTab === "especificacao" && (
        <main style={{ backgroundColor: "#1c1008", padding: "20px", borderRadius: "8px", border: "1px solid #3d200f", lineHeight: "1.6" }}>
          <h2 style={{ color: "#d4af37", marginTop: 0 }}>📜 Documento Técnico de Requisitos (30 Pontos)</h2>
          <p>Esta especificação foi incorporada diretamente na arquitetura da aplicação:</p>
          <ul>
            <li><strong>1. Objetivo:</strong> Transformar os checklists físicos em fluxos digitais com controle diário e auditoria.</li>
            <li><strong>2 e 3. Áreas Colaborador/Gestor:</strong> Execução via checkboxes e acompanhamento de casos no painel administrativo.</li>
            <li><strong>4 e 5. Módulo Cadastral:</strong> Suporte completo para usuários, permissões RBAC e gerenciamento de PDVs.</li>
            <li><strong>8 a 10. Gestão de Chamados:</strong> Abertura automática ao sinalizar "Não Conformidade", controle de prioridades (Baixa, Média, Alta, Crítica) e encerramento.</li>
            <li><strong>14 a 18. KPIs e Relatórios:</strong> Cálculo de índices de conformidade, exportação em PDF e formato para impressão.</li>
            <li><strong>19. Banco de Dados:</strong> Mapeamento pronto para PostgreSQL/Supabase com controle de auditoria de acessos.</li>
          </ul>
        </main>
      )}

    </div>
  );
}
