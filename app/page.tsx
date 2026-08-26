'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvxsqyfmljelxbwtakny.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sNTIaRT4NJmORYin8lp8LQ_ACoj0EO-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LISTA_PDVS_PADRAO = [
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

const ITENS_VERIFICACAO_PADRAO = [
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

export default function App() {
  const [abaAtiva, setAbaAtiva] = useState<'operador' | 'gestor'>('operador');
  const [subAbaGestor, setSubAbaGestor] = useState<'relatorios' | 'usuarios' | 'novo_checklist'>('relatorios');

  // Listas Dinâmicas
  const [pdvs, setPdvs] = useState<string[]>(LISTA_PDVS_PADRAO);
  const [itensChecklist, setItensChecklist] = useState<string[]>(ITENS_VERIFICACAO_PADRAO);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<{ id: string; nome: string; cargo: string }[]>([]);

  // Formulário Operador
  const [pdv, setPdv] = useState(LISTA_PDVS_PADRAO[0]);
  const [tipo, setTipo] = useState('Abertura');
  const [operador, setOperador] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});
  
  // Cadastro de Novo Usuário (Gestor)
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('Operador');

  // Cadastro de Novo Item de Checklist (Gestor)
  const [novoItemTexto, setNovoItemTexto] = useState('');

  // Status
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'alerta'; texto: string } | null>(null);

  // Painel Gestor
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Carregar Dados Salvos
  useEffect(() => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios_cadastrados') || '[]');
    const itensSalvos = JSON.parse(localStorage.getItem('itens_checklist_custom') || '[]');

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
      console.warn('Falha no Supabase, buscando dados locais.');
    }

    const dadosLocais = JSON.parse(localStorage.getItem('checklists_local') || '[]');
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

  // Ação: Cadastrar Novo Usuário
  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;

    const novo = { id: Date.now().toString(), nome: novoUsuarioNome, cargo: novoUsuarioCargo };
    const listaAtualizada = [...usuariosCadastrados, novo];
    
    setUsuariosCadastrados(listaAtualizada);
    localStorage.setItem('usuarios_cadastrados', JSON.stringify(listaAtualizada));
    
    setNovoUsuarioNome('');
    setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
  };

  // Ação: Cadastrar Novo Item de Checklist
  const handleAdicionarItemChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemTexto.trim()) return;

    const listaAtualizada = [...itensChecklist, novoItemTexto];
    setItensChecklist(listaAtualizada);
    localStorage.setItem('itens_checklist_custom', JSON.stringify(listaAtualizada));

    setNovoItemTexto('');
    setMensagem({ tipo: 'sucesso', texto: 'Novo item adicionado ao Checklist!' });
  };

  // Ação: Salvar Checklist (Operador)
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const pendentes = itensChecklist.filter((item) => !respostas[item]);
    if (pendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `Atenção: Marque todas as opções! Faltam ${pendentes.length} item(ns).`,
      });
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

    const historicoLocal = JSON.parse(localStorage.getItem('checklists_local') || '[]');
    localStorage.setItem('checklists_local', JSON.stringify([novoRegistro, ...historicoLocal]));

    setMensagem({
      tipo: salvouSupabase ? 'sucesso' : 'alerta',
      texto: salvouSupabase 
        ? '✅ Checklist salvo com sucesso no Banco de Dados!' 
        : '⚡ Salvo localmente! (Sem conexão direta com banco)'
    });

    setOperador('');
    setRespostas({});
    setSupervisaoChecked(false);
    setRegrasChecked({});
    setEnviando(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Navegação Principal */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/80 border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setAbaAtiva('operador')}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              abaAtiva === 'operador'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            📋 Check-list PDV
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva('gestor')}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
              abaAtiva === 'gestor'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            ⚙️ Painel Gestor
          </button>
        </div>

        <div className="p-4 sm:p-8">
          
          {/* ABA OPERADOR */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvar} className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Operações de Ponto de Venda
                </h1>
                <p className="text-xs text-slate-400 mt-1">Preenchimento rápido e intuitivo.</p>
              </div>

              {mensagem && (
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center ${
                    mensagem.tipo === 'sucesso'
                      ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400'
                      : mensagem.tipo === 'alerta'
                      ? 'bg-amber-500/10 border border-amber-500/40 text-amber-400'
                      : 'bg-rose-500/10 border border-rose-500/40 text-rose-400'
                  }`}
                >
                  {mensagem.texto}
                </div>
              )}

              {/* Dados Iniciais */}
              <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Bar / PDV
                  </label>
                  <select
                    value={pdv}
                    onChange={(e) => setPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {pdvs.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tipo
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Abertura">Abertura</option>
                      <option value="Fechamento">Fechamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Operador
                    </label>
                    {usuariosCadastrados.length > 0 ? (
                      <select
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Selecione o Operador</option>
                        {usuariosCadastrados.map((u) => (
                          <option key={u.id} value={u.nome}>{u.nome} ({u.cargo})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Digite seu Nome"
                        value={operador}
                        onChange={(e) => setOperador(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Itens do Checklist */}
              <div>
                <h2 className="text-base font-bold text-white mb-3">Itens de Verificação</h2>
                <div className="space-y-3">
                  {itensChecklist.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                      <span className="text-sm font-semibold text-slate-200 block">{item}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Conforme', val: 'Conforme', active: 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40', inactive: 'bg-slate-800/80 text-emerald-400 border-emerald-900/40 hover:bg-emerald-950/30' },
                          { label: 'Ñ Conforme', val: 'Não Conforme', active: 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-900/40', inactive: 'bg-slate-800/80 text-rose-400 border-rose-900/40 hover:bg-rose-950/30' },
                          { label: 'N/A', val: 'Não se aplica', active: 'bg-slate-600 border-slate-400 text-white shadow-lg', inactive: 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/30' }
                        ].map((b) => (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => handleOptionChange(item, b.val)}
                            className={`py-2.5 px-1 text-xs font-bold rounded-xl border transition-all text-center ${
                              respostas[item] === b.val ? b.active : b.inactive
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisão */}
              <div className="space-y-3 pt-2">
                <h2 className="text-base font-bold text-white">Supervisão & Regras</h2>
                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  supervisaoChecked ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 rounded"
                  />
                  <span className="text-xs font-bold uppercase">Verificação de Supervisão Realizada</span>
                </label>

                <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                  {REGRAS_SUPERVISAO.map((regra, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={(e) => setRegrasChecked((prev) => ({ ...prev, [index]: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 accent-blue-500 rounded"
                        required
                      />
                      <span className="text-xs font-medium text-slate-300">{regra}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all text-sm uppercase tracking-wider"
              >
                {enviando ? 'Salvando...' : 'Finalizar e Salvar Checklist'}
              </button>
            </form>
          )}

          {/* ABA GESTOR */}
          {abaAtiva === 'gestor' && (
            <div className="space-y-6">
              
              {/* Subnavegação do Gestor */}
              <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('relatorios')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    subAbaGestor === 'relatorios' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  📊 Relatórios
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('usuarios')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    subAbaGestor === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  👤 Cadastrar Usuários
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaGestor('novo_checklist')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                    subAbaGestor === 'novo_checklist' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  📝 Novo Checklist
                </button>
              </div>

              {mensagem && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl">
                  {mensagem.texto}
                </div>
              )}

              {/* SUB-ABA: RELATÓRIOS */}
              {subAbaGestor === 'relatorios' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h2 className="text-base font-bold text-white">Relatório da Operação</h2>
                    <button
                      type="button"
                      onClick={carregarHistorico}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700"
                    >
                      🔄 Atualizar
                    </button>
                  </div>

                  {carregandoHistorico ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Carregando dados...</div>
                  ) : historico.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-sm">Nenhum checklist enviado ainda.</div>
                  ) : (
                    <div className="space-y-3">
                      {historico.map((reg) => (
                        <div key={reg.id || reg.criado_em} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex flex-wrap justify-between items-center border-b border-slate-800/80 pb-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{reg.pdv}</span>
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                                {reg.tipo_checklist}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(reg.criado_em).toLocaleString('pt-BR')}
                            </span>
                          </div>

                          <div className="text-xs text-slate-300">
                            <strong>Operador:</strong> {reg.operador}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {Object.entries(reg.respostas_itens || {}).map(([k, v]: any) => (
                              <div key={k} className="flex justify-between text-[11px] p-2 bg-slate-900/80 rounded-xl border border-slate-800">
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

              {/* SUB-ABA: CADASTRO DE USUÁRIOS */}
              {subAbaGestor === 'usuarios' && (
                <div className="space-y-6">
                  <form onSubmit={handleCadastrarUsuario} className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <h2 className="text-sm font-bold text-white">Cadastrar Novo Usuário</h2>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Ex: João Silva"
                        value={novoUsuarioNome}
                        onChange={(e) => setNovoUsuarioNome(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Cargo / Função</label>
                      <select
                        value={novoUsuarioCargo}
                        onChange={(e) => setNovoUsuarioCargo(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none"
                      >
                        <option value="Operador">Operador de Bar</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Gerente">Gerente</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase"
                    >
                      Salvar Usuário
                    </button>
                  </form>

                  {/* Lista de Usuários Cadastrados */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Usuários Cadastrados ({usuariosCadastrados.length})
                    </h3>
                    <div className="space-y-2">
                      {usuariosCadastrados.map((u) => (
                        <div key={u.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{u.nome}</span>
                          <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700">
                            {u.cargo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-ABA: NOVO CHECKLIST */}
              {subAbaGestor === 'novo_checklist' && (
                <div className="space-y-6">
                  <form onSubmit={handleAdicionarItemChecklist} className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                    <h2 className="text-sm font-bold text-white">Adicionar Novo Item de Verificação</h2>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Descrição da Checagem</label>
                      <input
                        type="text"
                        placeholder="Ex: Checar temperatura da máquina de chopp"
                        value={novoItemTexto}
                        onChange={(e) => setNovoItemTexto(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase"
                    >
                      Adicionar Item
                    </button>
                  </form>

                  {/* Lista de Itens Atuais */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Itens do Checklist Ativo ({itensChecklist.length})
                    </h3>
                    <div className="space-y-2">
                      {itensChecklist.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-300">
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
