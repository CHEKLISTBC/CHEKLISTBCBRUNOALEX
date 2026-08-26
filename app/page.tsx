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

export default function DashboardChecklistCountry() {
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

  // Feedback Visual
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

  // Salvamento Automático Local
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

  // Seleção exclusiva por Checkbox (Se já estiver selecionado, desmarca)
  const handleCheckboxOption = (item: string, valor: string) => {
    setRespostas((prev) => {
      if (prev[item] === valor) {
        const cop = { ...prev };
        delete cop[item];
        return cop;
      }
      return { ...prev, [item]: valor };
    });
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
        texto: `🤠 Atenção, peão! Faltam ${pendentes.length} item(ns) para verificar.`,
      });
      return;
    }

    if (!operadorNome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Informe ou selecione o operador responsável!' });
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
      console.warn('Conexão remota indisponível. Armazenado localmente.');
    }

    const historicoAtualizado = [novoRegistro, ...historico];
    salvarAutomaticoLocal(historicoAtualizado);

    setMensagem({
      tipo: bancoSincronizado ? 'sucesso' : 'alerta',
      texto: bancoSincronizado
        ? '🌾 Checklist salvo e sincronizado na estância!'
        : '⚡ Salvo localmente na fazenda! (Aguardando rede)',
    });

    setOperadorNome('');
    setRespostas({});
    setSupervisaoChecked(false);
    setRegrasChecked({});
    setEnviando(false);
  };

  const handleAdicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemChecklist.trim()) return;

    const listaAtualizada = [...itensChecklist, novoItemChecklist.trim()];
    setItensChecklist(listaAtualizada);
    localStorage.setItem('app_checklist_itens', JSON.stringify(listaAtualizada));
    setNovoItemChecklist('');
    setMensagem({ tipo: 'sucesso', texto: 'Novo item incorporado ao checklist!' });
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
    setMensagem({ tipo: 'sucesso', texto: 'Item removido do checklist!' });
  };

  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;

    const novo = { id: Date.now().toString(), nome: novoUsuarioNome.trim(), cargo: novoUsuarioCargo };
    const listaAtualizada = [novo, ...usuariosCadastrados];
    setUsuariosCadastrados(listaAtualizada);
    localStorage.setItem('app_usuarios', JSON.stringify(listaAtualizada));
    setNovoUsuarioNome('');
    setMensagem({ tipo: 'sucesso', texto: 'Usuário registrado na tropa!' });
  };

  const relatoriosFiltrados = historico.filter((item) =>
    filtroPdvRelatorio === 'TODOS' ? true : item.pdv === filtroPdvRelatorio
  );

  return (
    <div className="min-h-screen bg-[#18100a] text-[#f4eae1] py-6 px-3 sm:px-6 font-sans antialiased">
      <div className="max-w-5xl mx-auto bg-[#26180f] rounded-3xl shadow-2xl border-2 border-[#6e4323] overflow-hidden">
        
        {/* Cabeçalho Estilo Country Premium */}
        <header className="bg-gradient-to-r from-[#3b2011] via-[#522e17] to-[#3b2011] p-6 border-b-2 border-[#6e4323] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="text-4xl p-2 bg-[#18100a]/50 rounded-2xl border border-[#b8860b]">🤠</div>
            <div>
              <h1 className="text-2xl font-black text-[#d4af37] tracking-wider uppercase font-serif">
                Gestão & Checklist Fazenda
              </h1>
              <p className="text-xs text-[#c29b7f] font-medium">Controle Operacional dos Pontos de Venda</p>
            </div>
          </div>

          <nav className="flex p-1.5 bg-[#18100a] rounded-2xl border border-[#6e4323] gap-1">
            <button
              type="button"
              onClick={() => setAbaAtiva('operador')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                abaAtiva === 'operador'
                  ? 'bg-[#8b4513] text-white shadow-md border border-[#d4af37]'
                  : 'text-[#a0826c] hover:text-white'
              }`}
            >
              📋 Operação
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('gestor')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                abaAtiva === 'gestor'
                  ? 'bg-[#8b4513] text-white shadow-md border border-[#d4af37]'
                  : 'text-[#a0826c] hover:text-white'
              }`}
            >
              ⚙️ Gestor
            </button>
          </nav>
        </header>

        <main className="p-4 sm:p-8">
          {/* Mensagens de Notificação */}
          {mensagem && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex justify-between items-center shadow-lg ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-[#1b3820] border-[#388e3c] text-[#a5d6a7]'
                  : mensagem.tipo === 'alerta'
                  ? 'bg-[#3e2723] border-[#d4af37] text-[#ffd54f]'
                  : 'bg-[#3b1212] border-[#e53935] text-[#ef9a9a]'
              }`}
            >
              <span>{mensagem.texto}</span>
              <button type="button" onClick={() => setMensagem(null)} className="text-sm font-bold opacity-80 hover:opacity-100">✕</button>
            </div>
          )}

          {/* ABA OPERADOR */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvarChecklist} className="space-y-6">
              
              {/* Dados Principais */}
              <div className="bg-[#18100a] p-5 rounded-2xl border border-[#522e17] space-y-4 shadow-inner">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
                  📍 Dados da Operação
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#c29b7f] mb-1">Selecione o PDV</label>
                    <select
                      value={pdvSelecionado}
                      onChange={(e) => setPdvSelecionado(e.target.value)}
                      className="w-full bg-[#26180f] border border-[#6e4323] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {pdvs.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c29b7f] mb-1">Turno</label>
                    <select
                      value={tipoChecklist}
                      onChange={(e) => setTipoChecklist(e.target.value)}
                      className="w-full bg-[#26180f] border border-[#6e4323] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="Abertura">Abertura</option>
                      <option value="Fechamento">Fechamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#c29b7f] mb-1">Operador Responsável</label>
                    {usuariosCadastrados.length > 0 ? (
                      <select
                        value={operadorNome}
                        onChange={(e) => setOperadorNome(e.target.value)}
                        className="w-full bg-[#26180f] border border-[#6e4323] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        required
                      >
                        <option value="">Selecione o peão/operador...</option>
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
                        className="w-full bg-[#26180f] border border-[#6e4323] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Itens do Checklist com Caixas Checkbox */}
              <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#d4af37]">
                  📝 Itens de Verificação
                </h2>

                <div className="space-y-2.5">
                  {itensChecklist.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#18100a] rounded-2xl border border-[#522e17] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <span className="text-xs font-bold text-white leading-relaxed">{idx + 1}. {item}</span>

                      {/* Opções Estilo Checkbox */}
                      <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                        {[
                          { label: 'Conforme', val: 'Conforme', style: 'border-[#2e7d32] text-[#81c784] bg-[#1b3820]/40' },
                          { label: 'Ñ Conforme', val: 'Não Conforme', style: 'border-[#c62828] text-[#ef9a9a] bg-[#3b1212]/40' },
                          { label: 'N/A', val: 'Não se aplica', style: 'border-[#6e4323] text-[#c29b7f] bg-[#26180f]' },
                        ].map((box) => {
                          const estaMarcado = respostas[item] === box.val;
                          return (
                            <label
                              key={box.val}
                              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                                estaMarcado
                                  ? `${box.style} border-2 shadow-lg ring-1 ring-[#d4af37]`
                                  : 'bg-[#26180f] border-[#522e17] text-[#a0826c] hover:border-[#6e4323]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={estaMarcado}
                                onChange={() => handleCheckboxOption(item, box.val)}
                                className="w-4 h-4 rounded accent-[#8b4513] cursor-pointer"
                              />
                              <span className="text-[11px] font-black uppercase">{box.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisão e Regras */}
              <div className="bg-[#18100a] p-5 rounded-2xl border border-[#522e17] space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#26180f] rounded-xl border border-[#6e4323]">
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#8b4513] cursor-pointer"
                  />
                  <span className="text-xs font-black uppercase text-[#d4af37]">
                    Verificação de Supervisão Realizada
                  </span>
                </label>

                <div className="space-y-2 pt-2">
                  {REGRAS_SUPERVISAO.map((regra, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={() => handleRegraToggle(index)}
                        className="w-4 h-4 mt-0.5 rounded accent-[#8b4513] cursor-pointer"
                        required
                      />
                      <span className="text-xs font-medium text-[#c29b7f]">{regra}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-[#8b4513] via-[#a0522d] to-[#8b4513] hover:from-[#a0522d] hover:to-[#8b4513] text-white font-black py-4 rounded-2xl shadow-xl border-2 border-[#d4af37] text-xs uppercase tracking-wider transition-all"
              >
                {enviando ? 'Salvando...' : '🌾 Salvar Checklist da Fazenda'}
              </button>
            </form>
          )}

          {/* ABA GESTOR */}
          {abaAtiva === 'gestor' && (
            <div>
              {!gestorAutenticado ? (
                /* Login de Segurança */
                <form onSubmit={handleLoginGestor} className="max-w-sm mx-auto my-10 bg-[#18100a] p-6 rounded-2xl border border-[#6e4323] text-center space-y-4 shadow-xl">
                  <div className="text-4xl">🔐</div>
                  <h2 className="text-sm font-black text-[#d4af37] uppercase tracking-wider">Painel do Gestor</h2>
                  <p className="text-xs text-[#c29b7f]">Digite a senha de administrador para acessar os relatórios.</p>

                  <input
                    type="password"
                    placeholder="Senha de acesso"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    className="w-full bg-[#26180f] border border-[#6e4323] rounded-xl p-3 text-xs text-white text-center focus:outline-none focus:border-[#d4af37]"
                  />

                  {erroSenha && <p className="text-[11px] text-[#ef9a9a] font-bold">Senha incorreta. Tente admin123</p>}

                  <button
                    type="submit"
                    className="w-full bg-[#8b4513] hover:bg-[#a0522d] text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider border border-[#d4af37]"
                  >
                    Entrar no Painel
                  </button>
                </form>
              ) : (
                /* Sub-abas do Gestor */
                <div className="space-y-6">
                  <div className="flex border-b border-[#522e17] pb-3 gap-2 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('relatorios')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                        subAbaGestor === 'relatorios' ? 'bg-[#8b4513] text-white border border-[#d4af37]' : 'bg-[#18100a] text-[#a0826c] border border-[#522e17]'
                      }`}
                    >
                      📊 Acompanhamento PDV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('checklists')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                        subAbaGestor === 'checklists' ? 'bg-[#8b4513] text-white border border-[#d4af37]' : 'bg-[#18100a] text-[#a0826c] border border-[#522e17]'
                      }`}
                    >
                      📝 Gerenciar Checklists
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('usuarios')}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                        subAbaGestor === 'usuarios' ? 'bg-[#8b4513] text-white border border-[#d4af37]' : 'bg-[#18100a] text-[#a0826c] border border-[#522e17]'
                      }`}
                    >
                      🤠 Cadastrar Usuários
                    </button>
                  </div>

                  {/* RELATÓRIOS E IMPRESSÃO / PDF */}
                  {subAbaGestor === 'relatorios' && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#18100a] p-4 rounded-2xl border border-[#522e17] gap-3">
                        <div className="w-full sm:w-auto">
                          <label className="block text-[11px] font-black text-[#d4af37] uppercase mb-1">Filtrar por PDV</label>
                          <select
                            value={filtroPdvRelatorio}
                            onChange={(e) => setFiltroPdvRelatorio(e.target.value)}
                            className="w-full sm:w-64 bg-[#26180f] border border-[#6e4323] rounded-xl p-2.5 text-xs text-white"
                          >
                            <option value="TODOS">Todos os Pontos de Venda</option>
                            {pdvs.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-[#8b4513] hover:bg-[#a0522d] text-white text-xs px-4 py-2.5 rounded-xl font-black border border-[#d4af37]"
                        >
                          🖨️ Imprimir / Baixar PDF
                        </button>
                      </div>

                      {/* Lista de Registros */}
                      {relatoriosFiltrados.length === 0 ? (
                        <div className="text-center py-10 text-[#a0826c] text-xs">Nenhum registro encontrado para este filtro.</div>
                      ) : (
                        <div className="space-y-3">
                          {relatoriosFiltrados.map((reg) => (
                            <div key={reg.id || reg.criado_em} className="p-4 bg-[#18100a] rounded-2xl border border-[#522e17] space-y-3">
                              <div className="flex justify-between items-center border-b border-[#3b2011] pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#d4af37] text-xs">{reg.pdv}</span>
                                  <span className="text-[10px] bg-[#8b4513]/30 text-[#d4af37] border border-[#6e4323] px-2 py-0.5 rounded-full font-bold">
                                    {reg.tipo_checklist}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#a0826c]">
                                  {new Date(reg.criado_em).toLocaleString('pt-BR')}
                                </span>
                              </div>

                              <p className="text-xs text-white">
                                <strong className="text-[#c29b7f]">Operador:</strong> {reg.operador}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {Object.entries(reg.respostas_itens || {}).map(([k, v]: any) => (
                                  <div key={k} className="flex justify-between text-[11px] p-2 bg-[#26180f] rounded-xl border border-[#522e17]">
                                    <span className="text-[#c29b7f] truncate mr-2">{k}</span>
                                    <span className={`font-bold ${v === 'Conforme' ? 'text-[#81c784]' : v === 'Não Conforme' ? 'text-[#ef9a9a]' : 'text-[#a0826c]'}`}>
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

                  {/* GERENCIAR CHECKLISTS (EDITAR / APAGAR / NOVO) */}
                  {subAbaGestor === 'checklists' && (
                    <div className="space-y-6">
                      <form onSubmit={handleAdicionarItem} className="space-y-3 bg-[#18100a] p-4 rounded-2xl border border-[#522e17]">
                        <h2 className="text-xs font-black text-[#d4af37] uppercase">Cadastrar Novo Item no Checklist</h2>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ex: Verificar selagem dos recipientes"
                            value={novoItemChecklist}
                            onChange={(e) => setNovoItemChecklist(e.target.value)}
                            className="flex-1 bg-[#26180f] border border-[#6e4323] rounded-xl p-2.5 text-xs text-white"
                            required
                          />
                          <button
                            type="submit"
                            className="bg-[#8b4513] hover:bg-[#a0522d] text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase border border-[#d4af37]"
                          >
                            ➕ Adicionar
                          </button>
                        </div>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-[#d4af37] uppercase tracking-wider">
                          Itens de Checklist Ativos ({itensChecklist.length})
                        </h3>
                        {itensChecklist.map((item, idx) => (
                          <div key={idx} className="p-3 bg-[#18100a] rounded-xl border border-[#522e17] flex justify-between items-center gap-2 text-xs">
                            {itemEmEdicao === idx ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={textoEdicaoItem}
                                  onChange={(e) => setTextoEdicaoItem(e.target.value)}
                                  className="flex-1 bg-[#26180f] border border-[#d4af37] rounded-lg p-2 text-xs text-white"
                                />
                                <button type="button" onClick={() => handleSalvarEdicaoItem(idx)} className="bg-[#2e7d32] text-white px-3 py-1.5 rounded-lg font-bold">Salvar</button>
                                <button type="button" onClick={() => setItemEmEdicao(null)} className="bg-[#3e2723] text-white px-3 py-1.5 rounded-lg">Cancelar</button>
                              </div>
                            ) : (
                              <>
                                <span className="text-white font-medium"><strong className="text-[#d4af37] mr-2">{idx + 1}.</strong>{item}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => { setItemEmEdicao(idx); setTextoEdicaoItem(item); }}
                                    className="bg-[#26180f] text-[#d4af37] border border-[#6e4323] px-2.5 py-1 rounded-lg text-[11px] font-bold"
                                  >
                                    ✏️ Renomear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleExcluirItem(idx)}
                                    className="bg-[#3b1212] text-[#ef9a9a] border border-[#c62828] px-2.5 py-1 rounded-lg text-[11px] font-bold"
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

                  {/* CADASTRO DE USUÁRIOS */}
                  {subAbaGestor === 'usuarios' && (
                    <div className="space-y-6">
                      <form onSubmit={handleCadastrarUsuario} className="space-y-4 bg-[#18100a] p-4 rounded-2xl border border-[#522e17]">
                        <h2 className="text-xs font-black text-[#d4af37] uppercase">Cadastrar Novo Usuário</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nome completo..."
                            value={novoUsuarioNome}
                            onChange={(e) => setNovoUsuarioNome(e.target.value)}
                            className="bg-[#26180f] border border-[#6e4323] rounded-xl p-2.5 text-xs text-white"
                            required
                          />
                          <select
                            value={novoUsuarioCargo}
                            onChange={(e) => setNovoUsuarioCargo(e.target.value)}
                            className="bg-[#26180f] border border-[#6e4323] rounded-xl p-2.5 text-xs text-white"
                          >
                            <option value="Operador de Bar">Operador de Bar</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Gerente">Gerente</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-[#2e7d32] hover:bg-[#388e3c] text-white font-black py-2.5 rounded-xl text-xs uppercase border border-[#a5d6a7]">
                          Cadastrar Usuário
                        </button>
                      </form>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-[#d4af37] uppercase">Usuários Cadastrados ({usuariosCadastrados.length})</h3>
                        {usuariosCadastrados.map((u) => (
                          <div key={u.id} className="p-3 bg-[#18100a] rounded-xl border border-[#522e17] flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{u.nome}</span>
                            <span className="bg-[#26180f] text-[#c29b7f] border border-[#6e4323] px-2.5 py-1 rounded-lg text-[10px]">
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
