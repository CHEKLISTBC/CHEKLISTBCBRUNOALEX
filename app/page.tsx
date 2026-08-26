'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvxsqyfmljelxbwtakny.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sNTIaRT4NJmORYin8lp8LQ_ACoj0EO-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LISTA_PDVS = ['Caipirodromo', 'Bar Central', 'Restaurante Principal', 'Quiosque Praia'];

const ITENS_VERIFICACAO = [
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

  // Estados Operador
  const [pdv, setPdv] = useState(LISTA_PDVS[0]);
  const [tipo, setTipo] = useState('Abertura');
  const [operador, setOperador] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Estados Gestor
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Buscar dados para o Gestor
  const carregarHistorico = async () => {
    setCarregandoHistorico(true);
    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'gestor') {
      carregarHistorico();
    }
  }, [abaAtiva]);

  const handleOptionChange = (item: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [item]: valor }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    const itensPendentes = ITENS_VERIFICACAO.filter((item) => !respostas[item]);
    if (itensPendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `Atenção: Responda a todos os itens. Faltam ${itensPendentes.length} item(ns).`,
      });
      return;
    }

    setEnviando(true);

    try {
      const payload = {
        pdv,
        tipo_checklist: tipo,
        operador,
        verificacao_supervisao: supervisaoChecked,
        respostas_itens: respostas,
        criado_em: new Date().toISOString(),
      };

      const { error } = await supabase.from('checklists').insert([payload]);
      if (error) throw error;

      setMensagem({ tipo: 'sucesso', texto: 'Checklist salvo com sucesso no banco de dados!' });
      setOperador('');
      setRespostas({});
      setSupervisaoChecked(false);
      setRegrasChecked({});
    } catch (err: any) {
      console.error(err);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar no banco de dados.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Navegação por Abas */}
        <div className="flex border-b border-slate-700 bg-slate-900/50">
          <button
            onClick={() => setAbaAtiva('operador')}
            className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-all ${
              abaAtiva === 'operador'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📋 Preencher Checklist
          </button>
          <button
            onClick={() => setAbaAtiva('gestor')}
            className={`flex-1 py-4 text-center text-sm font-bold uppercase tracking-wider transition-all ${
              abaAtiva === 'gestor'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            📊 Painel do Gestor
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* CONTEÚDO DA ABA OPERADOR */}
          {abaAtiva === 'operador' && (
            <form onSubmit={handleSalvar} className="space-y-8">
              <div className="border-b border-slate-700 pb-4">
                <h1 className="text-2xl font-extrabold text-white">Checklist de Operações PDV</h1>
                <p className="text-sm text-slate-400">Preenchimento diário de rotina.</p>
              </div>

              {mensagem && (
                <div
                  className={`p-4 rounded-xl text-sm font-semibold ${
                    mensagem.tipo === 'sucesso'
                      ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500 text-rose-400'
                  }`}
                >
                  {mensagem.texto}
                </div>
              )}

              {/* Campos Iniciais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">PDV</label>
                  <select
                    value={pdv}
                    onChange={(e) => setPdv(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white"
                  >
                    {LISTA_PDVS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white"
                  >
                    <option value="Abertura">Abertura</option>
                    <option value="Fechamento">Fechamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Operador</label>
                  <input
                    type="text"
                    placeholder="Nome do Operador"
                    value={operador}
                    onChange={(e) => setOperador(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white"
                    required
                  />
                </div>
              </div>

              {/* Itens */}
              <div>
                <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Itens para Verificação</h2>
                <div className="space-y-3">
                  {ITENS_VERIFICACAO.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-700 gap-3">
                      <span className="text-sm font-medium text-slate-200">{item}</span>
                      <div className="flex gap-2">
                        {[
                          { label: 'Conforme', value: 'Conforme', style: 'peer-checked:bg-emerald-600 peer-checked:text-white text-emerald-400 border-emerald-500/40' },
                          { label: 'Não Conforme', value: 'Não Conforme', style: 'peer-checked:bg-rose-600 peer-checked:text-white text-rose-400 border-rose-500/40' },
                          { label: 'N/A', value: 'Não se aplica', style: 'peer-checked:bg-slate-600 peer-checked:text-white text-slate-400 border-slate-600' },
                        ].map((opt) => (
                          <label key={opt.value} className="cursor-pointer flex-1 sm:flex-none">
                            <input
                              type="radio"
                              name={`item-${index}`}
                              value={opt.value}
                              checked={respostas[item] === opt.value}
                              onChange={() => handleOptionChange(item, opt.value)}
                              className="peer hidden"
                            />
                            <span className={`w-full block text-center px-3 py-1.5 text-xs font-semibold rounded-lg border ${opt.style}`}>
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regras e Supervisao */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Double Check Supervisão</h2>
                <label className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supervisaoChecked}
                    onChange={(e) => setSupervisaoChecked(e.target.checked)}
                    className="w-5 h-5 text-amber-500 bg-slate-900 border-slate-600 rounded"
                  />
                  <span className="text-sm font-semibold text-amber-300">Verificação Supervisão Realizada</span>
                </label>

                <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700">
                  {REGRAS_SUPERVISAO.map((regra, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!regrasChecked[index]}
                        onChange={(e) => setRegrasChecked((prev) => ({ ...prev, [index]: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 text-blue-500 bg-slate-900 border-slate-600 rounded"
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
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-sm uppercase tracking-wider"
              >
                {enviando ? 'Salvando...' : 'Finalizar e Salvar Checklist'}
              </button>
            </form>
          )}

          {/* CONTEÚDO DA ABA GESTOR */}
          {abaAtiva === 'gestor' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Histórico e Relatórios</h1>
                  <p className="text-sm text-slate-400">Acompanhamento dos checklists enviados.</p>
                </div>
                <button
                  onClick={carregarHistorico}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-4 py-2 rounded-lg font-semibold"
                >
                  🔄 Atualizar Data
                </button>
              </div>

              {carregandoHistorico ? (
                <div className="text-center py-12 text-slate-400">Carregando relatórios...</div>
              ) : historico.length === 0 ? (
                <div className="text-center py-12 text-slate-400">Nenhum checklist registrado até o momento.</div>
              ) : (
                <div className="space-y-4">
                  {historico.map((registro) => (
                    <div key={registro.id || registro.criado_em} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 space-y-3">
                      <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
                        <div>
                          <span className="text-base font-bold text-white mr-3">{registro.pdv}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold">
                            {registro.tipo_checklist}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Operador:</span> {registro.operador} |{' '}
                          {new Date(registro.criado_em).toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {/* Respostas resumidas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {Object.entries(registro.respostas_itens || {}).map(([item, resp]: any) => (
                          <div key={item} className="flex justify-between text-xs p-2 bg-slate-800/80 rounded border border-slate-700/50">
                            <span className="text-slate-300 truncate mr-2">{item}</span>
                            <span
                              className={`font-bold ${
                                resp === 'Conforme'
                                  ? 'text-emerald-400'
                                  : resp === 'Não Conforme'
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {resp}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-slate-400 pt-1">
                        Supervisão acompanhou:{' '}
                        <strong className={registro.verificacao_supervisao ? 'text-emerald-400' : 'text-slate-500'}>
                          {registro.verificacao_supervisao ? 'SIM' : 'NÃO'}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
