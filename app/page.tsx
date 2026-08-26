'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvxsqyfmljelxbwtakny.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sNTIaRT4NJmORYin8lp8LQ_ACoj0EO-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LISTA_PDVS_ORIGINAL = [
  'Caipirodromo',
  'Bar Central',
  'Restaurante Principal',
  'Quiosque Praia',
  'Bar do Camarote',
  'Bar da Piscina',
  'Bar do Palco Principal',
  'Bar Vip / Área VIP',
  'Praça de Alimentação',
  'Estoque Central / Apoio',
];

const ITENS_PADRAO = [
  'Layout organizado e limpo',
  'Balcões limpos',
  'Verificar freezers e geladeiras ligados',
  'Geladeiras abastecidas e organizadas',
  'Todos os utensílios da mise en place disponíveis',
  'Bancadas organizadas',
  'Computador apto para vendas',
  'PDV limpo e organizado',
  'Freezer de sorvete limpo e organizado',
  'Verificar se todas as porções estão disponíveis',
];

const REGRAS_SUPERVISAO = [
  'PROIBIDO uso de celular no local de trabalho e qualquer tipo de aparelho sonoro.',
  'Estou ciente de que o uniforme deve estar bem limpo e passado.',
];

export default function DashboardChecklist() {
  const [abaAtiva, setAbaAtiva] = useState<'operador' | 'gestor'>('operador');
  const [subAbaGestor, setSubAbaGestor] = useState<'relatorios' | 'usuarios' | 'checklists'>('relatorios');

  // Autenticação Gestor
  const [gestorAutenticado, setGestorAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState(false);

  // Estados dos Dados
  const [pdvs] = useState<string[]>(LISTA_PDVS_ORIGINAL);
  const [itensChecklist, setItensChecklist] = useState<string[]>(ITENS_PADRAO);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<{ id: string; nome: string; cargo: string }[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);

  // Formulário Operador
  const [pdvSelecionado, setPdvSelecionado] = useState(LISTA_PDVS_ORIGINAL[0]);
  const [tipoChecklist, setTipoChecklist] = useState('Abertura');
  const [operadorNome, setOperadorNome] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});

  // Filtros e Gestão
  const [filtroPdvRelatorio, setFiltroPdvRelatorio] = useState('TODOS');
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('Operador de Bar');
  const [novoItemChecklist, setNovoItemChecklist] = useState('');
  const [itemEmEdicao, setItemEmEdicao] = useState<number | null>(null);
  const [textoEdicaoItem, setTextoEdicaoItem] = useState('');

  // UI Feedback
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'alerta'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Carregamento Inicial
  useEffect(() => {
    const usuariosSalvos = localStorage.getItem('app_usuarios');
    const itensSalvos = localStorage.getItem('app_checklist_itens');
    const historicoSalvo = localStorage.getItem('app_checklists_local');

    if (usuariosSalvos) setUsuariosCadastrados(JSON.parse(usuariosSalvos));
    if (itensSalvos) setItensChecklist(JSON.parse(itensSalvos));
    if (historicoSalvo) setHistorico(JSON.parse(historicoSalvo));
  }, []);

  // Salvamento Automático dos Registros do Checklist
  const salvarAutomaticoLocal = (novosDados: any[]) => {
    setHistorico(novosDados);
    localStorage.setItem('app_checklists_local', JSON.stringify(novosDados));
  };

  const handleLoginGestor = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaInput === 'admin123') {
      setGestorAutenticado(true);
      setErroSenha(false);
      setSenhaInput('');
    } else {
      setErroSenha(true);
    }
  };

  const handleOpcaoChange = (item: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [item]: valor }));
  };

  const handleRegraToggle = (index: number) => {
    setRegrasChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSalvarChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const pendentes = itensChecklist.filter((item) => !respostas[item]);
    if (pendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `Atenção: Responda todas as verificações! Faltam ${pendentes.length} item(ns).`,
      });
      return;
    }

    if (!operadorNome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe ou selecione o nome do operador!' });
      return;
    }

    setEnviando(true);

    const novoRegistro = {
      id: Date.now().toString(),
      pdv: pdvSelecionado,
      tipo_checklist: tipoChecklist,
      operador: operadorNome,
      verificacao_supervisao: supervisaoChecked,
      respostas_itens: respostas,
      criado_em: new Date().toISOString(),
    };

    let bancoSincronizado = false;

    try {
      const { error } = await supabase.from('checklists').insert([{
        pdv: novoRegistro.pdv,
        tipo_checklist: novoRegistro.tipo_checklist,
        operador: novoRegistro.operador,
        verificacao_supervisao: novoRegistro.verificacao_supervisao,
        respostas_itens: novoRegistro.respostas_itens,
        criado_em: novoRegistro.criado_em,
      }]);

      if (!error) bancoSincronizado = true;
    } catch (err) {
      console.warn('Falha na conexão externa. Dados retidos no armazenamento local.');
    }

    const historicoAtualizado = [novoRegistro, ...historico];
    salvarAutomaticoLocal(historicoAtualizado);

    setMensagem({
      tipo: bancoSincronizado ? 'sucesso' : 'alerta',
      texto: bancoSincronizado
        ? ' Check-list finalizado e sincronizado no banco de dados!'
        : '⚡ Registrado localmente com sucesso! (Sincronização pendente)',
    });

    // Reset de Formulário
    setOperadorNome('');
    setRespostas({});
    setSupervisaoChecked(false);
    setRegrasChecked({});
    setEnviando(false);
  };

  // Funções de Gestão do Checklist
  const handleAdicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemChecklist.trim()) return;

    const listaAtualizada = [...itensChecklist, novoItemChecklist.trim()];
    setItensChecklist(listaAtualizada);
    localStorage.setItem('app_checklist_itens', JSON.stringify(listaAtualizada));
    setNovoItemChecklist('');
    setMensagem({ tipo: 'sucesso', texto: 'Novo item adicionado ao checklist!' });
  };

  const handleSalvarEdicaoItem = (index: number) => {
    if (!textoEdicaoItem.trim()) return;
    const listaAtualizada = [...itensChecklist];
    listaAtualizada[index] = textoEdicaoItem.trim();
    setItensChecklist(listaAtualizada);
    localStorage.setItem('app_checklist_itens', JSON.stringify(listaAtualizada));
    setItemEmEdicao(null);
    setTextoEdicaoItem('');
    setMensagem({ tipo: 'sucesso', texto: 'Item renomeado com sucesso!' });
  };

  const handleExcluirItem = (index: number) => {
    const listaAtualizada = itensChecklist.filter((_, i) => i !== index);
    setItensChecklist(listaAtualizada);
    localStorage.setItem('app_checklist_itens', JSON.stringify(listaAtualizada));
    setMensagem({ tipo: 'sucesso', texto: 'Item removido com sucesso!' });
  };

  // Gestão de Usuários
  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;

    const novo = { id: Date.now().toString(), nome: novoUsuarioNome.trim(), cargo: novoUsuarioCargo };
    const listaAtualizada = [novo, ...usuariosCadastrados];
    setUsuariosCadastrados(listaAtualizada);
    localStorage.setItem('app_usuarios', JSON.stringify(listaAtualizada));
    setNovoUsuarioNome('');
    setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
  };

  // Filtragem de Relatórios por PDV
  const relatoriosFiltrados = historico.filter((item) =>
    filtroPdvRelatorio === 'TODOS' ? true : item.pdv === filtroPdvRelatorio
  );

  const handleImprimirRelatorio = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 font-sans antialiased">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Header do Dashboard */}
        <header className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Dashboard Operacional PDV</h1>
              <p className="text-xs text-slate-400">Gestão Integrada & Controle de Qualidade</p>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setAbaAtiva('operador')}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'operador'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Operação PDV
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('gestor')}
              className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === 'gestor'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Painel do Gestor
            </button>
          </nav>
        </header>

        <main className="p-6">
          {/* Alertas de Notificação */}
          {mensagem && (
            <div
              className={`mb-6 p-4 rounded-xl text-xs font-semibold border flex justify-between items-center ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300'
                  : mensagem.tipo === 'alerta'
                  ? 'bg-amber-950/50 border-amber-800/50 text-amber-300'
                  : 'bg-rose-950/50 border-rose-800/50 text-rose-300'
              }`}
            >
              <span>{mensagem.texto}</span>
              <button type="button" onClick={() => setMensagem(null)} className="text-sm opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* ABA OPERADOR */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvarChecklist} className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-4">
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Informações da Operação</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Ponto de Venda (PDV)</label>
                    <select
                      value={pdvSelecionado}
                      onChange={(e) => setPdvSelecionado(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {pdvs.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Turno / Tipo</label>
                    <select
                      value={tipoChecklist}
                      onChange={(e) => setTipoChecklist(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Abertura">Abertura</option>
                      <option value="Fechamento">Fechamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Operador Responsável</label>
                    {usuariosCadastrados.length > 0 ? (
                      <select
                        value={operadorNome}
                        onChange={(e) => setOperadorNome(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      >
                        <option value="">Selecione o operador...</option>
                        {usuariosCadastrados.map((u) => (
                          <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nome do operador"
                        value={operadorNome}
                        onChange={(e) => setOperadorNome(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Itens do Checklist */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Itens de Verificação</h2>
                
                <div className="space-y-2">
                  {itensChecklist.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-xs font-medium text-slate-200">{idx + 1}. {item}</span>
                      
                      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                        {[
                          { label: 'Conforme', val: 'Conforme', activeClass: 'bg-emerald-600 border-emerald-500 text-white' },
                          { label: 'Não Conforme', val: 'Não Conforme', activeClass: 'bg-rose-600 border-rose-500 text-white' },
                          { label: 'N/A', val: 'Não se aplica', activeClass: 'bg-slate-700 border-slate-600 text-white' },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            type="button"
                            onClick={() => handleOpcaoChange(item, btn.val)}
                            className={`px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                              respostas[item] === btn.val
                                ? `${btn.activeClass} shadow-md`
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisão e Regras */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-200">Acompanhamento e validação de supervisão realizados</span>
                </label>

                <div className="space-y-2 border-t border-slate-800/60 pt-3">
                  {REGRAS_SUPERVISAO.map((regra, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={() => handleRegraToggle(index)}
                        className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        required
                      />
                      <span className="text-xs text-slate-400">{regra}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                {enviando ? 'Processando...' : 'Finalizar e Salvar Checklist'}
              </button>
            </form>
          )}

          {/* ABA GESTOR */}
          {abaAtiva === 'gestor' && (
            <div>
              {!gestorAutenticado ? (
                /* Tela de Login de Segurança */
                <form onSubmit={handleLoginGestor} className="max-w-sm mx-auto my-12 bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Acesso Restrito ao Gestor</h2>
                  <p className="text-xs text-slate-400">Insira a senha de administrador para acessar os relatórios.</p>

                  <input
                    type="password"
                    placeholder="Senha de acesso"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {erroSenha && <p className="text-[11px] text-rose-400 font-semibold">Senha incorreta. Tente novamente.</p>}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider"
                  >
                    Autenticar
                  </button>
                </form>
              ) : (
                /* Painel de Gestão Liberado */
                <div className="space-y-6">
                  {/* Navegação Sub-Abas Gestor */}
                  <div className="flex border-b border-slate-800 pb-3 gap-2 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('relatorios')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        subAbaGestor === 'relatorios' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      📊 Relatórios por PDV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('checklists')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        subAbaGestor === 'checklists' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      📝 Gerenciar Checklists
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('usuarios')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        subAbaGestor === 'usuarios' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      👥 Cadastrar Usuários
                    </button>
                  </div>

                  {/* RELATÓRIOS E EXPORTAÇÃO */}
                  {subAbaGestor === 'relatorios' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-4 rounded-xl border border-slate-800 gap-3">
                        <div className="w-full sm:w-auto">
                          <label className="block text-[11px] font-bold text-indigo-400 uppercase mb-1">Filtrar por PDV</label>
                          <select
                            value={filtroPdvRelatorio}
                            onChange={(e) => setFiltroPdvRelatorio(e.target.value)}
                            className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="TODOS">Todos os Pontos de Venda</option>
                            {pdvs.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleImprimirRelatorio}
                            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-lg font-semibold border border-slate-700"
                          >
                            🖨️ Imprimir / Salvar PDF
                          </button>
                        </div>
                      </div>

                      {/* Lista de Checklists Salvos */}
                      {relatoriosFiltrados.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">Nenhum registro de checklist encontrado para o filtro selecionado.</div>
                      ) : (
                        <div className="space-y-3 print:space-y-6">
                          {relatoriosFiltrados.map((reg) => (
                            <div key={reg.id || reg.criado_em} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 print:border-slate-300 print:text-black">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <div>
                                  <span className="font-bold text-indigo-400 text-xs print:text-black">{reg.pdv}</span>
                                  <span className="ml-2 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                                    {reg.tipo_checklist}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(reg.criado_em).toLocaleString('pt-BR')}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300">
                                <strong>Operador:</strong> {reg.operador}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {Object.entries(reg.respostas_itens || {}).map(([k, v]: any) => (
                                  <div key={k} className="flex justify-between text-[11px] p-2 bg-slate-900 rounded-lg border border-slate-800/60">
                                    <span className="text-slate-400 truncate mr-2">{k}</span>
                                    <span className={`font-bold ${v === 'Conforme' ? 'text-emerald-400' : v === 'Não Conforme' ? 'text-rose-400' : 'text-slate-400'}`}>
                                      {v}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* GERENCIAR CHECKLISTS */}
                  {subAbaGestor === 'checklists' && (
                    <div className="space-y-6">
                      <form onSubmit={handleAdicionarItem} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h2 className="text-xs font-bold text-indigo-400 uppercase">Adicionar Novo Item ao Checklist</h2>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Descrição do novo item de verificação..."
                            value={novoItemChecklist}
                            onChange={(e) => setNovoItemChecklist(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase"
                          >
                            Adicionar
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Itens de Checklist Ativos ({itensChecklist.length})</h3>
                        {itensChecklist.map((item, idx) => (
                          <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center gap-2 text-xs">
                            {itemEmEdicao === idx ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={textoEdicaoItem}
                                  onChange={(e) => setTextoEdicaoItem(e.target.value)}
                                  className="flex-1 bg-slate-900 border border-indigo-500 rounded-lg p-2 text-xs text-white"
                                />
                                <button type="button" onClick={() => handleSalvarEdicaoItem(idx)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold">Salvar</button>
                                <button type="button" onClick={() => setItemEmEdicao(null)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">Cancelar</button>
                              </div>
                            ) : (
                              <>
                                <span className="text-slate-200"><strong className="text-indigo-400 mr-2">{idx + 1}.</strong>{item}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setItemEmEdicao(idx); setTextoEdicaoItem(item); }}
                                    className="bg-slate-900 text-indigo-400 border border-slate-700 px-2.5 py-1 rounded-lg text-[11px]"
                                  >
                                    ✏️ Renomear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExcluirItem(idx)}
                                    className="bg-rose-950/40 text-rose-400 border border-rose-800/50 px-2.5 py-1 rounded-lg text-[11px]"
                                  >
                                    🗑️ Apagar
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CADASTRAR USUÁRIOS */}
                  {subAbaGestor === 'usuarios' && (
                    <div className="space-y-6">
                      <form onSubmit={handleCadastrarUsuario} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h2 className="text-xs font-bold text-indigo-400 uppercase">Cadastrar Novo Usuário</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nome completo..."
                            value={novoUsuarioNome}
                            onChange={(e) => setNovoUsuarioNome(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                            required
                          />
                          <select
                            value={novoUsuarioCargo}
                            onChange={(e) => setNovoUsuarioCargo(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                          >
                            <option value="Operador de Bar">Operador de Bar</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Gerente">Gerente</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs uppercase">
                          Cadastrar Usuário
                        </button>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Usuários Ativos ({usuariosCadastrados.length})</h3>
                        {usuariosCadastrados.map((u) => (
                          <div key={u.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{u.nome}</span>
                            <span className="bg-slate-900 text-indigo-400 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px]">
                              {u.cargo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
