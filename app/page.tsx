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

export default function DashboardCountry() {
  const [abaAtiva, setAbaAtiva] = useState<'operador' | 'gestor'>('operador');
  const [subAbaGestor, setSubAbaGestor] = useState<'relatorios' | 'usuarios' | 'checklists'>('relatorios');

  // Autenticação
  const [gestorAutenticado, setGestorAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');
  const [erroSenha, setErroSenha] = useState(false);

  // Estados principais
  const [pdvs] = useState<string[]>(LISTA_PDVS_ORIGINAL);
  const [itensChecklist, setItensChecklist] = useState<string[]>(ITENS_PADRAO);
  const [usuariosCadastrados, setUsuariosCadastrados] = useState<{ id: string; nome: string; cargo: string }[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);

  // Formulário do Operador
  const [pdvSelecionado, setPdvSelecionado] = useState(LISTA_PDVS_ORIGINAL[0]);
  const [tipoChecklist, setTipoChecklist] = useState('Abertura');
  const [operadorNome, setOperadorNome] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});

  // Filtros e Edição do Gestor
  const [filtroPdvRelatorio, setFiltroPdvRelatorio] = useState('TODOS');
  const [novoUsuarioNome, setNovoUsuarioNome] = useState('');
  const [novoUsuarioCargo, setNovoUsuarioCargo] = useState('Operador de Bar');
  const [novoItemChecklist, setNovoItemChecklist] = useState('');
  const [itemEmEdicao, setItemEmEdicao] = useState<number | null>(null);
  const [textoEdicaoItem, setTextoEdicaoItem] = useState('');

  // UI
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | 'alerta'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Carregamento de dados salvos
  useEffect(() => {
    const u = localStorage.getItem('app_usuarios');
    const i = localStorage.getItem('app_checklist_itens');
    const h = localStorage.getItem('app_checklists_local');

    if (u) setUsuariosCadastrados(JSON.parse(u));
    if (i) setItensChecklist(JSON.parse(i));
    if (h) setHistorico(JSON.parse(h));
  }, []);

  const salvarLocal = (novosDados: any[]) => {
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

  // Marcar/Desmarcar Checkbox dos Itens
  const handleCheckboxOption = (item: string, valor: string) => {
    setRespostas((prev) => {
      if (prev[item] === valor) {
        const c = { ...prev };
        delete c[item];
        return c;
      }
      return { ...prev, [item]: valor };
    });
  };

  const handleSalvarChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const pendentes = itensChecklist.filter((i) => !respostas[i]);
    if (pendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `🤠 Preencha todos os itens! Faltam ${pendentes.length} verificação(ões).`,
      });
      return;
    }

    if (!operadorNome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Selecione ou informe o nome do operador!' });
      return;
    }

    setEnviando(true);

    const registro = {
      id: Date.now().toString(),
      pdv: pdvSelecionado,
      tipo_checklist: tipoChecklist,
      operador: operadorNome,
      verificacao_supervisao: supervisaoChecked,
      respostas_itens: respostas,
      criado_em: new Date().toISOString(),
    };

    let emNuvem = false;
    try {
      const { error } = await supabase.from('checklists').insert([registro]);
      if (!error) emNuvem = true;
    } catch (err) {
      console.warn('Banco offline. Salvo apenas no dispositivo.');
    }

    salvarLocal([registro, ...historico]);

    setMensagem({
      tipo: emNuvem ? 'sucesso' : 'alerta',
      texto: emNuvem ? '🌾 Checklist gravado no banco de dados!' : '⚡ Salvo localmente na fazenda!',
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
    const nova = [...itensChecklist, novoItemChecklist.trim()];
    setItensChecklist(nova);
    localStorage.setItem('app_checklist_itens', JSON.stringify(nova));
    setNovoItemChecklist('');
    setMensagem({ tipo: 'sucesso', texto: 'Novo item adicionado ao checklist!' });
  };

  const handleSalvarEdicaoItem = (index: number) => {
    if (!textoEdicaoItem.trim()) return;
    const nova = [...itensChecklist];
    nova[index] = textoEdicaoItem.trim();
    setItensChecklist(nova);
    localStorage.setItem('app_checklist_itens', JSON.stringify(nova));
    setItemEmEdicao(null);
    setTextoEdicaoItem('');
    setMensagem({ tipo: 'sucesso', texto: 'Item renomeado com sucesso!' });
  };

  const handleExcluirItem = (index: number) => {
    const nova = itensChecklist.filter((_, i) => i !== index);
    setItensChecklist(nova);
    localStorage.setItem('app_checklist_itens', JSON.stringify(nova));
    setMensagem({ tipo: 'sucesso', texto: 'Item excluído!' });
  };

  const handleCadastrarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoUsuarioNome.trim()) return;
    const novo = { id: Date.now().toString(), nome: novoUsuarioNome.trim(), cargo: novoUsuarioCargo };
    const nova = [novo, ...usuariosCadastrados];
    setUsuariosCadastrados(nova);
    localStorage.setItem('app_usuarios', JSON.stringify(nova));
    setNovoUsuarioNome('');
    setMensagem({ tipo: 'sucesso', texto: 'Usuário cadastrado com sucesso!' });
  };

  const relatoriosFiltrados = historico.filter((item) =>
    filtroPdvRelatorio === 'TODOS' ? true : item.pdv === filtroPdvRelatorio
  );

  return (
    <div className="min-h-screen bg-[#120a05] text-[#f4eae1] py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-[#211209] rounded-3xl shadow-2xl border-2 border-[#573016] overflow-hidden">
        
        {/* Cabeçalho Limpo sem SVGs Gigantes */}
        <header className="bg-gradient-to-r from-[#31180b] via-[#482411] to-[#31180b] p-5 border-b-2 border-[#573016] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#120a05]/60 rounded-xl border border-[#b8860b]">🤠</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#d4af37] uppercase tracking-wide font-serif">
                Dashboard Fazenda
              </h1>
              <p className="text-xs text-[#b88c6e]">Controle Operacional dos PDVs</p>
            </div>
          </div>

          <nav className="flex bg-[#120a05] p-1.5 rounded-xl border border-[#573016] gap-1">
            <button
              type="button"
              onClick={() => setAbaAtiva('operador')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${
                abaAtiva === 'operador' ? 'bg-[#7a3d13] text-white border border-[#d4af37]' : 'text-[#8c6b53]'
              }`}
            >
              📋 Operação
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('gestor')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider ${
                abaAtiva === 'gestor' ? 'bg-[#7a3d13] text-white border border-[#d4af37]' : 'text-[#8c6b53]'
              }`}
            >
              ⚙️ Gestor
            </button>
          </nav>
        </header>

        <main className="p-4 sm:p-6">
          {mensagem && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs font-bold border flex justify-between items-center ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-[#1b3820] border-[#388e3c] text-[#a5d6a7]'
                  : mensagem.tipo === 'alerta'
                  ? 'bg-[#3e2723] border-[#d4af37] text-[#ffd54f]'
                  : 'bg-[#3b1212] border-[#e53935] text-[#ef9a9a]'
              }`}
            >
              <span>{mensagem.texto}</span>
              <button type="button" onClick={() => setMensagem(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* OPERAÇÃO */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvarChecklist} className="space-y-5">
              
              <div className="bg-[#120a05] p-4 rounded-xl border border-[#482411] space-y-3">
                <h2 className="text-xs font-black uppercase text-[#d4af37]">📍 Dados Principais</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#b88c6e] mb-1">PDV</label>
                    <select
                      value={pdvSelecionado}
                      onChange={(e) => setPdvSelecionado(e.target.value)}
                      className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2.5 text-xs text-white"
                    >
                      {pdvs.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#b88c6e] mb-1">Turno</label>
                    <select
                      value={tipoChecklist}
                      onChange={(e) => setTipoChecklist(e.target.value)}
                      className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2.5 text-xs text-white"
                    >
                      <option value="Abertura">Abertura</option>
                      <option value="Fechamento">Fechamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#b88c6e] mb-1">Operador</label>
                    {usuariosCadastrados.length > 0 ? (
                      <select
                        value={operadorNome}
                        onChange={(e) => setOperadorNome(e.target.value)}
                        className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2.5 text-xs text-white"
                        required
                      >
                        <option value="">Selecione...</option>
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
                        className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2.5 text-xs text-white"
                        required
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* LISTA DE CONFERÊNCIA COM CHECKBOXES */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-black uppercase text-[#d4af37]">📝 Conferencia de Itens</h2>
                {itensChecklist.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#120a05] rounded-xl border border-[#482411] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{idx + 1}. {item}</span>

                    <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                      {[
                        { label: 'Conforme', val: 'Conforme', active: 'border-[#2e7d32] bg-[#1b3820] text-[#a5d6a7]' },
                        { label: 'Ñ Conforme', val: 'Não Conforme', active: 'border-[#c62828] bg-[#3b1212] text-[#ef9a9a]' },
                        { label: 'N/A', val: 'Não se aplica', active: 'border-[#573016] bg-[#211209] text-[#b88c6e]' },
                      ].map((box) => {
                        const checked = respostas[item] === box.val;
                        return (
                          <label
                            key={box.val}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer text-[11px] font-black ${
                              checked ? `${box.active} border-2 shadow` : 'bg-[#211209] border-[#482411] text-[#8c6b53]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxOption(item, box.val)}
                              className="w-3.5 h-3.5 accent-[#7a3d13]"
                            />
                            <span>{box.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* REGRAS */}
              <div className="bg-[#120a05] p-4 rounded-xl border border-[#482411] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#211209] rounded-lg border border-[#573016]">
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-4 h-4 accent-[#7a3d13]"
                  />
                  <span className="text-xs font-black uppercase text-[#d4af37]">Supervisão Realizada</span>
                </label>

                <div className="space-y-1.5">
                  {REGRAS_SUPERVISAO.map((regra, index) => (
                    <label key={index} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={() => setRegrasChecked((p) => ({ ...p, [index]: !p[index] }))}
                        className="w-3.5 h-3.5 mt-0.5 accent-[#7a3d13]"
                        required
                      />
                      <span className="text-[11px] text-[#b88c6e]">{regra}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-[#7a3d13] hover:bg-[#8f4817] text-white font-black py-3.5 rounded-xl border border-[#d4af37] text-xs uppercase tracking-wider shadow-lg"
              >
                {enviando ? 'Gravando...' : '🌾 Salvar Checklist'}
              </button>
            </form>
          )}

          {/* GESTOR */}
          {abaAtiva === 'gestor' && (
            <div>
              {!gestorAutenticado ? (
                <form onSubmit={handleLoginGestor} className="max-w-xs mx-auto my-8 bg-[#120a05] p-5 rounded-xl border border-[#573016] text-center space-y-3">
                  <span className="text-3xl">🔑</span>
                  <h2 className="text-xs font-black text-[#d4af37] uppercase">Painel do Gestor</h2>
                  <input
                    type="password"
                    placeholder="Senha (admin123)"
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2 text-xs text-white text-center"
                  />
                  {erroSenha && <p className="text-[10px] text-rose-400 font-bold">Senha Incorreta!</p>}
                  <button type="submit" className="w-full bg-[#7a3d13] text-white font-bold py-2 rounded-lg text-xs uppercase border border-[#d4af37]">
                    Acessar
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="flex border-b border-[#482411] pb-2 gap-2 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('relatorios')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${
                        subAbaGestor === 'relatorios' ? 'bg-[#7a3d13] text-white border border-[#d4af37]' : 'bg-[#120a05] text-[#8c6b53]'
                      }`}
                    >
                      📊 Relatórios
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('checklists')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${
                        subAbaGestor === 'checklists' ? 'bg-[#7a3d13] text-white border border-[#d4af37]' : 'bg-[#120a05] text-[#8c6b53]'
                      }`}
                    >
                      📝 Gerenciar Checklists
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubAbaGestor('usuarios')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${
                        subAbaGestor === 'usuarios' ? 'bg-[#7a3d13] text-white border border-[#d4af37]' : 'bg-[#120a05] text-[#8c6b53]'
                      }`}
                    >
                      👥 Usuários
                    </button>
                  </div>

                  {subAbaGestor === 'relatorios' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-[#120a05] p-3 rounded-xl border border-[#482411]">
                        <select
                          value={filtroPdvRelatorio}
                          onChange={(e) => setFiltroPdvRelatorio(e.target.value)}
                          className="bg-[#211209] border border-[#573016] rounded-lg p-2 text-xs text-white"
                        >
                          <option value="TODOS">Todos os PDVs</option>
                          {pdvs.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-[#7a3d13] text-white text-xs px-3 py-2 rounded-lg font-bold border border-[#d4af37]"
                        >
                          🖨️ Imprimir / PDF
                        </button>
                      </div>

                      {relatoriosFiltrados.map((reg) => (
                        <div key={reg.id || reg.criado_em} className="p-3 bg-[#120a05] rounded-xl border border-[#482411] space-y-2">
                          <div className="flex justify-between text-xs border-b border-[#31180b] pb-1">
                            <span className="font-bold text-[#d4af37]">{reg.pdv} ({reg.tipo_checklist})</span>
                            <span className="text-[10px] text-[#8c6b53]">{new Date(reg.criado_em).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="text-xs text-slate-200"><strong>Operador:</strong> {reg.operador}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {Object.entries(reg.respostas_itens || {}).map(([k, v]: any) => (
                              <div key={k} className="flex justify-between text-[11px] p-1.5 bg-[#211209] rounded-lg border border-[#31180b]">
                                <span className="text-[#b88c6e] truncate mr-2">{k}</span>
                                <span className={`font-bold ${v === 'Conforme' ? 'text-[#a5d6a7]' : v === 'Não Conforme' ? 'text-[#ef9a9a]' : 'text-[#8c6b53]'}`}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {subAbaGestor === 'checklists' && (
                    <div className="space-y-4">
                      <form onSubmit={handleAdicionarItem} className="flex gap-2 bg-[#120a05] p-3 rounded-xl border border-[#482411]">
                        <input
                          type="text"
                          placeholder="Novo item..."
                          value={novoItemChecklist}
                          onChange={(e) => setNovoItemChecklist(e.target.value)}
                          className="flex-1 bg-[#211209] border border-[#573016] rounded-lg p-2 text-xs text-white"
                          required
                        />
                        <button type="submit" className="bg-[#7a3d13] text-white px-3 py-2 rounded-lg text-xs font-bold border border-[#d4af37]">Adicionar</button>
                      </form>

                      <div className="space-y-1.5">
                        {itensChecklist.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-[#120a05] rounded-lg border border-[#482411] flex justify-between items-center text-xs">
                            {itemEmEdicao === idx ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={textoEdicaoItem}
                                  onChange={(e) => setTextoEdicaoItem(e.target.value)}
                                  className="flex-1 bg-[#211209] border border-[#d4af37] rounded p-1 text-xs text-white"
                                />
                                <button type="button" onClick={() => handleSalvarEdicaoItem(idx)} className="bg-[#2e7d32] text-white px-2 py-1 rounded">Salvar</button>
                                <button type="button" onClick={() => setItemEmEdicao(null)} className="bg-[#3b1212] text-white px-2 py-1 rounded">Sair</button>
                              </div>
                            ) : (
                              <>
                                <span><strong className="text-[#d4af37] mr-1.5">{idx + 1}.</strong>{item}</span>
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => { setItemEmEdicao(idx); setTextoEdicaoItem(item); }} className="bg-[#211209] text-[#d4af37] px-2 py-1 rounded border border-[#573016] text-[10px]">✏️ Editar</button>
                                  <button type="button" onClick={() => handleExcluirItem(idx)} className="bg-[#3b1212] text-[#ef9a9a] px-2 py-1 rounded border border-[#c62828] text-[10px]">🗑️ Excluir</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {subAbaGestor === 'usuarios' && (
                    <div className="space-y-4">
                      <form onSubmit={handleCadastrarUsuario} className="space-y-2 bg-[#120a05] p-3 rounded-xl border border-[#482411]">
                        <input
                          type="text"
                          placeholder="Nome..."
                          value={novoUsuarioNome}
                          onChange={(e) => setNovoUsuarioNome(e.target.value)}
                          className="w-full bg-[#211209] border border-[#573016] rounded-lg p-2 text-xs text-white"
                          required
                        />
                        <button type="submit" className="w-full bg-[#2e7d32] text-white font-bold py-2 rounded-lg text-xs uppercase">Cadastrar</button>
                      </form>

                      <div className="space-y-1.5">
                        {usuariosCadastrados.map((u) => (
                          <div key={u.id} className="p-2.5 bg-[#120a05] rounded-lg border border-[#482411] flex justify-between text-xs">
                            <span className="font-bold">{u.nome}</span>
                            <span className="text-[#b88c6e]">{u.cargo}</span>
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
