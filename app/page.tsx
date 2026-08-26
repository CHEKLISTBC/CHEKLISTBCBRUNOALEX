'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvxsqyfmljelxbwtakny.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sNTIaRT4NJmORYin8lp8LQ_ACoj0EO-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LISTA_PDVS_FAZENDA = [
  '🤠 Bar do Rancho',
  '🌾 Caipiródromo',
  '🐴 Bar da Arena',
  '🍺 Saloon Principal',
  '🔥 Bar da Queima do Alho',
  '🚜 Quiosque do Curral',
  '🥩 Restaurante Fazenda',
  '👑 Camarote VIP Country',
  '📦 Almoxarifado / Estoque Central',
];

const ITENS_PADRAO_FAZENDA = [
  'Limpeza e organização do balcão rústico',
  'Geladeiras e freezers refrigeração OK',
  'Mise en place e utensílios abastecidos',
  'Estoque de bebidas e gelo suficiente',
  'Caixa e terminal de vendas aptos',
  'Área de atendimento limpa e sem resíduos',
  'Verificação de porções e petiscos da roça',
];

const REGRAS_FAZENDA = [
  'PROIBIDO uso de celular durante a operação no recinto.',
  'Uniforme completo, limpo e com alinhamento padrão da Fazenda.',
];

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'operador' | 'gestor'>('operador');
  const [subAbaGestor, setSubAbaGestor] = useState<'relatorios' | 'usuarios' | 'novo_checklist'>('relatorios');

  // Listas Dinâmicas
  const [pdvs] = useState<string[]>(LISTA_PDVS_FAZENDA);
  const [itensChecklist, setItensChecklist] = useState<string[]>(ITENS_PADRAO_FAZENDA);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<{ id: string; nome: string; cargo: string }[]>([]);

  // Formulário Operador
  const [pdv, setPdv] = useState(LISTA_PDVS_FAZENDA[0]);
  const [tipo, setTipo] = useState('Abertura');
  const [operador, setOperador] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});
  
  // Filtro de Relatório no Gestor
  const [filtroPdv, setFiltroPdv] = useState('TODOS');

  // Gestor - Formulários
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('Operador de Bar');
  const [novoItemTexto, setNovoItemTexto] = useState('');

  // Status
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'alerta'; texto: string } | null>(null);

  // Painel Gestor
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Carregar Dados Salvos do Navegador
  useEffect(() => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('fazenda_usuarios') || '[]');
    const itensSalvos = JSON.parse(localStorage.getItem('fazenda_itens_checklist') || '[]');

    if (usuariosSalvos.length > 0) setUsuariosCadastrados(usuariosSalvos);
    if (itensSalvos.length > 0) setItensChecklist(itensSalvos);
  }, []);

  const carregarHistorico = async () => {
    setCarregandoHistorico(true);
    let dadosSupabase: any[] = [];

    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!error && data) dadosSupabase = data;
    } catch (e) {
      console.warn('Conexão Supabase ausente, lendo histórico local.');
    }

    const dadosLocais = JSON.parse(localStorage.getItem('fazenda_checklists_local') || '[]');
    const todos = [...dadosSupabase, ...dadosLocais];
    const unicos = Array.from(new Map(todos.map(item => [item.criado_em || item.id, item])).values());
    
    setHistorico(unicos);
    setCarregandoHistorico(false);
  };

  useEffect(() => {
    if (abaAtiva === 'gestor') carregarHistorico();
  }, [abaAtiva]);

  const handleOptionChange = (item: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [item]: valor }));
  };

  // Cadastrar Usuário
  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;

    const novo = { id: Date.now().toString(), nome: novoUsuarioNome, cargo: novoUsuarioCargo };
    const listaAtualizada = [novo, ...usuariosCadastrados];
    
    setUsuariosCadastrados(listaAtualizada);
    localStorage.setItem('fazenda_usuarios', JSON.stringify(listaAtualizada));
    
    setNovoUsuarioNome('');
    setMensagem({ tipo: 'sucesso', texto: '🤠 Peão / Colaborador cadastrado no sistema!' });
  };

  // Adicionar Item/Novo Checklist
  const handleAdicionarItemChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemTexto.trim()) return;

    const listaAtualizada = [...itensChecklist, novoItemTexto];
    setItensChecklist(listaAtualizada);
    localStorage.setItem('fazenda_itens_checklist', JSON.stringify(listaAtualizada));

    setNovoItemTexto('');
    setMensagem({ tipo: 'sucesso', texto: '🌾 Novo item incorporado à rotina da fazenda!' });
  };

  // Salvar Checklist
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const pendentes = itensChecklist.filter((item) => !respostas[item]);
    if (pendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `Atenção: Responda todos os itens da roça! Faltam ${pendentes.length} item(ns).`,
      });
      return;
    }

    if (!operador) {
      setMensagem({ tipo: 'erro', texto: 'Selecione ou informe o nome do operador!' });
      return;
    }

    setEnviando(true);

    const novoRegistro = {
      id: Date.now().toString(),
      pdv,
      tipo_checklist: tipo,
      operador,
      verificacao_supervisao: supervisaoChecked,
      respostas_itens: respostas,
      criado_em: new Date().toISOString(),
    };

    let salvouSupabase = false;

    try {
      const { error } = await supabase.from('checklists').insert([{
        pdv: novoRegistro.pdv,
        tipo_checklist: novoRegistro.tipo_checklist,
        operador: novoRegistro.operador,
        verificacao_supervisao: novoRegistro.verificacao_supervisao,
        respostas_itens: novoRegistro.respostas_itens,
        criado_em: novoRegistro.criado_em
      }]);

      if (!error) salvouSupabase = true;
    } catch (err) {
      console.error('Erro Supabase:', err);
    }

    const historicoLocal = JSON.parse(localStorage.getItem('fazenda_checklists_local') || '[]');
    localStorage.setItem('fazenda_checklists_local', JSON.stringify([novoRegistro, ...historicoLocal]));

    setMensagem({
      tipo: salvouSupabase ? 'sucesso' : 'alerta',
      texto: salvouSupabase 
        ? '🌾 Checklist gravado no banco de dados com sucesso!' 
        : '⚡ Salvo localmente na fazenda! (Aguardando sincronização)'
    });

    setOperador('');
    setRespostas({});
    setSupervisaoChecked(false);
    setRegrasChecked({});
    setEnviando(false);
  };

  const historicoFiltrado = historico.filter((item) => 
    filtroPdv === 'TODOS' ? true : item.pdv === filtroPdv
  );

  return (
    <div className="min-h-screen bg-[#1c130d] text-[#f4eae1] py-6 px-3 sm:px-6 font-sans">
      
      {/* Moldura Principal com Estilo Rústico Fazenda */}
      <div className="max-w-4xl mx-auto bg-[#2b1e16] rounded-3xl shadow-2xl border-2 border-[#8c5a32] overflow-hidden">
        
        {/* Cabeçalho Country */}
        <div className="bg-gradient-to-r from-[#422517] via-[#5c331e] to-[#422517] p-6 border-b-2 border-[#8c5a32] text-center">
          <span className="text-3xl">🤠</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#f3b351] tracking-wide uppercase mt-1">
            Gestão & Checklist Fazenda
          </h1>
          <p className="text-xs text-[#d3a882] mt-1 font-semibold">
            Controle Operacional dos Bares e Pontos de Venda
          </p>
        </div>

        {/* Abas Superiores */}
        <div className="grid grid-cols-2 p-2 bg-[#1a110a] border-b border-[#5c331e] gap-2">
          <button
            type="button"
            onClick={() => setAbaAtiva('operador')}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
              abaAtiva === 'operador'
                ? 'bg-[#8c5a32] text-white shadow-lg border border-[#f3b351]'
                : 'text-[#a88a72] hover:text-white hover:bg-[#2b1e16]'
            }`}
          >
            📋 Operação PDV
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('gestor')}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
              abaAtiva === 'gestor'
                ? 'bg-[#8c5a32] text-white shadow-lg border border-[#f3b351]'
                : 'text-[#a88a72] hover:text-white hover:bg-[#2b1e16]'
            }`}
          >
            ⚙️ Painel do Gestor
          </button>
        </div>

        <div className="p-4 sm:p-8">
          
          {/* MENSAGENS DE NOTIFICAÇÃO */}
          {mensagem && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-bold border ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-[#1b3820] border-[#388e3c] text-[#81c784]'
                  : mensagem.tipo === 'alerta'
                  ? 'bg-[#3e2723] border-[#f3b351] text-[#f3b351]'
                  : 'bg-[#3b1212] border-[#e53935] text-[#ef9a9a]'
              }`}
            >
              {mensagem.texto}
            </div>
          )}

          {/* ================= ABA OPERADOR ================= */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvar} className="space-y-6">
              
              {/* Seleção do Ponto e Operador */}
              <div className="space-y-4 bg-[#1a110a] p-5 rounded-2xl border border-[#5c331e]">
                <h2 className="text-xs font-black uppercase text-[#f3b351] tracking-wider">
                  📍 Dados da Operação
                </h2>

                <div>
                  <label className="block text-xs font-bold text-[#d3a882] mb-1">Selecione o Bar / PDV</label>
                  <select
                    value={pdv}
                    onChange={(e) => setPdv(e.target.value)}
                    className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#f3b351]"
                  >
                    {pdvs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#d3a882] mb-1">Turno / Tipo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#f3b351]"
                    >
                      <option value="Abertura">🌾 Abertura</option>
                      <option value="Fechamento">🌙 Fechamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#d3a882] mb-1">Operador Responsável</label>
                    {usuariosCadastrados.length > 0 ? (
                      <select
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#f3b351]"
                        required
                      >
                        <option value="">Selecione da lista...</option>
                        {usuariosCadastrados.map((u) => (
                          <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nome do Operador"
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#f3b351]"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Itens do Checklist */}
              <div className="space-y-3">
                <h2 className="text-sm font-black uppercase text-[#f3b351] tracking-wider">
                  📝 Itens de Verificação
                </h2>

                {itensChecklist.map((item, index) => (
                  <div key={index} className="p-4 bg-[#1a110a] rounded-2xl border border-[#5c331e] space-y-3">
                    <span className="text-sm font-bold text-white block">{item}</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Conforme', val: 'Conforme', style: 'bg-[#2e7d32] border-[#a5d6a7] text-white' },
                        { label: 'Ñ Conforme', val: 'Não Conforme', style: 'bg-[#c62828] border-[#ef9a9a] text-white' },
                        { label: 'N/A', val: 'Não se aplica', style: 'bg-[#4e342e] border-[#bcaaa4] text-white' }
                      ].map((b) => (
                        <button
                          key={b.val}
                          type="button"
                          onClick={() => handleOptionChange(item, b.val)}
                          className={`py-2.5 px-1 text-xs font-black rounded-xl border transition-all text-center ${
                            respostas[item] === b.val
                              ? `${b.style} shadow-lg scale-[1.02]`
                              : 'bg-[#2b1e16] text-[#a88a72] border-[#5c331e] hover:bg-[#3d2a1f]'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Supervisão */}
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  supervisaoChecked ? 'bg-[#4e342e] border-[#f3b351] text-[#f3b351]' : 'bg-[#1a110a] border-[#5c331e] text-[#a88a72]'
                }`}>
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#f3b351] rounded"
                  />
                  <span className="text-xs font-black uppercase">Acompanhamento da Supervisão Confirmado</span>
                </label>

                <div className="space-y-2 bg-[#1a110a] p-4 rounded-2xl border border-[#5c331e]">
                  {REGRAS_FAZENDA.map((regra, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={(e) => setRegrasChecked((prev) => ({ ...prev, [index]: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 accent-[#8c5a32] rounded"
                        required
                      />
                      <span className="text-xs font-medium text-[#d3a882]">{regra}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-[#8c5a32] to-[#a0683b] hover:from-[#a0683b] hover:to-[#b87843] text-white font-black py-4 rounded-2xl shadow-xl border border-[#f3b351] text-sm uppercase tracking-wider transition-all"
              >
                {enviando ? 'Salvando...' : '🌾 Salvar Checklist da Fazenda'}
              </button>
            </form>
          )}

          {/* ================= ABA GESTOR ================= */}
          {abaAtiva === 'gestor' && (
            <div className="space-y-6">
              
              {/* Navegação Secundária do Gestor */}
              <div className="flex border-b border-[#5c331e] pb-3 gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('relatorios')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap border ${
                    subAbaGestor === 'relatorios' ? 'bg-[#8c5a32] text-white border-[#f3b351]' : 'bg-[#1a110a] text-[#a88a72] border-[#5c331e]'
                  }`}
                >
                  📊 Acompanhamento PDV
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('usuarios')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap border ${
                    subAbaGestor === 'usuarios' ? 'bg-[#8c5a32] text-white border-[#f3b351]' : 'bg-[#1a110a] text-[#a88a72] border-[#5c331e]'
                  }`}
                >
                  🤠 Cadastrar Peão/Usuário
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('novo_checklist')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap border ${
                    subAbaGestor === 'novo_checklist' ? 'bg-[#8c5a32] text-white border-[#f3b351]' : 'bg-[#1a110a] text-[#a88a72] border-[#5c331e]'
                  }`}
                >
                  📝 Novo Checklist
                </button>
              </div>

              {/* GESTOR: RELATÓRIOS E ACOMPANHAMENTO */}
              {subAbaGestor === 'relatorios' && (
                <div className="space-y-4">
                  
                  {/* Filtro por PDV */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1a110a] p-4 rounded-2xl border border-[#5c331e] gap-3">
                    <div className="w-full sm:w-auto">
                      <label className="block text-xs font-bold text-[#f3b351] uppercase mb-1">Filtrar por Bar/PDV</label>
                      <select
                        value={filtroPdv}
                        onChange={(e) => setFiltroPdv(e.target.value)}
                        className="w-full sm:w-64 bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="TODOS">Todos os Pontos de Venda</option>
                        {pdvs.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={carregarHistorico}
                      className="bg-[#8c5a32] hover:bg-[#a0683b] text-white text-xs px-4 py-2.5 rounded-xl font-bold border border-[#f3b351]"
                    >
                      🔄 Atualizar Relatórios
                    </button>
                  </div>

                  {carregandoHistorico ? (
                    <div className="text-center py-10 text-[#d3a882] text-sm">Carregando dados da fazenda...</div>
                  ) : historicoFiltrado.length === 0 ? (
                    <div className="text-center py-10 text-[#a88a72] text-sm">Nenhum registro encontrado para este filtro.</div>
                  ) : (
                    <div className="space-y-3">
                      {historicoFiltrado.map((reg) => (
                        <div key={reg.id || reg.criado_em} className="p-4 bg-[#1a110a] rounded-2xl border border-[#5c331e] space-y-3">
                          <div className="flex flex-wrap justify-between items-center border-b border-[#3d2a1f] pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#f3b351] text-sm">{reg.pdv}</span>
                              <span className="text-[10px] bg-[#8c5a32]/30 text-[#f3b351] border border-[#8c5a32] px-2 py-0.5 rounded-full font-bold">
                                {reg.tipo_checklist}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#a88a72]">
                              {new Date(reg.criado_em).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div className="text-xs text-white">
                            <strong className="text-[#d3a882]">Operador:</strong> {reg.operador}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {Object.entries(reg.respostas_itens || {}).map(([k, v]: any) => (
                              <div key={k} className="flex justify-between text-[11px] p-2 bg-[#2b1e16] rounded-xl border border-[#5c331e]">
                                <span className="text-[#d3a882] truncate mr-2">{k}</span>
                                <span className={`font-bold ${v === 'Conforme' ? 'text-[#81c784]' : v === 'Não Conforme' ? 'text-[#ef9a9a]' : 'text-[#a88a72]'}`}>
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

              {/* GESTOR: CADASTRO DE USUÁRIOS */}
              {subAbaGestor === 'usuarios' && (
                <div className="space-y-6">
                  <form onSubmit={handleCadastrarUsuario} className="space-y-4 bg-[#1a110a] p-5 rounded-2xl border border-[#5c331e]">
                    <h2 className="text-xs font-black uppercase text-[#f3b351]">Cadastrar Novo Peão / Operador</h2>
                    
                    <div>
                      <label className="block text-xs font-bold text-[#d3a882] mb-1">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Ex: Zé da Silva"
                        value={novoUsuarioNome}
                        onChange={(e) => setNovoUsuarioNome(e.target.value)}
                        className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#d3a882] mb-1">Cargo</label>
                      <select
                        value={novoUsuarioCargo}
                        onChange={(e) => setNovoUsuarioCargo(e.target.value)}
                        className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white"
                      >
                        <option value="Operador de Bar">Operador de Bar</option>
                        <option value="Supervisor de Campo">Supervisor de Campo</option>
                        <option value="Gerente Geral">Gerente Geral</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#2e7d32] hover:bg-[#388e3c] text-white font-bold py-3 rounded-xl text-xs uppercase border border-[#a5d6a7]"
                    >
                      Cadastrar Operador
                    </button>
                  </form>

                  {/* Lista de Usuários */}
                  <div>
                    <h3 className="text-xs font-bold text-[#f3b351] uppercase tracking-wider mb-2">
                      Operadores Cadastrados ({usuariosCadastrados.length})
                    </h3>
                    <div className="space-y-2">
                      {usuariosCadastrados.map((u) => (
                        <div key={u.id} className="p-3 bg-[#1a110a] rounded-xl border border-[#5c331e] flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{u.nome}</span>
                          <span className="bg-[#2b1e16] text-[#d3a882] px-2.5 py-1 rounded-lg border border-[#8c5a32]">
                            {u.cargo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GESTOR: CRIAR NOVO CHECKLIST */}
              {subAbaGestor === 'novo_checklist' && (
                <div className="space-y-6">
                  <form onSubmit={handleAdicionarItemChecklist} className="space-y-4 bg-[#1a110a] p-5 rounded-2xl border border-[#5c331e]">
                    <h2 className="text-xs font-black uppercase text-[#f3b351]">Adicionar Item ao Checklist</h2>
                    
                    <div>
                      <label className="block text-xs font-bold text-[#d3a882] mb-1">Descrição do Item</label>
                      <input
                        type="text"
                        placeholder="Ex: Verificar estoque de fardo de gelo"
                        value={novoItemTexto}
                        onChange={(e) => setNovoItemTexto(e.target.value)}
                        className="w-full bg-[#2b1e16] border border-[#8c5a32] rounded-xl p-3 text-sm text-white"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#8c5a32] hover:bg-[#a0683b] text-white font-bold py-3 rounded-xl text-xs uppercase border border-[#f3b351]"
                    >
                      Adicionar ao Checklist
                    </button>
                  </form>

                  {/* Itens Atuais */}
                  <div>
                    <h3 className="text-xs font-bold text-[#f3b351] uppercase tracking-wider mb-2">
                      Itens Ativos no Checklist ({itensChecklist.length})
                    </h3>
                    <div className="space-y-2">
                      {itensChecklist.map((item, idx) => (
                        <div key={idx} className="p-3 bg-[#1a110a] rounded-xl border border-[#5c331e] text-xs text-white">
                          {idx + 1}. {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
