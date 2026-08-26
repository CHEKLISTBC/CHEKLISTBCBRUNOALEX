'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (utiliza variáveis de ambiente ou fallback direto)
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

export default function ChecklistPDV() {
  const [pdv, setPdv] = useState(LISTA_PDVS[0]);
  const [tipo, setTipo] = useState('Abertura');
  const [operador, setOperador] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [supervisaoChecked, setSupervisaoChecked] = useState(false);
  const [regrasChecked, setRegrasChecked] = useState<{ [key: number]: boolean }>({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const handleOptionChange = (item: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [item]: valor }));
  };

  const handleRegraChange = (index: number, checked: boolean) => {
    setRegrasChecked((prev) => ({ ...prev, [index]: checked }));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(null);

    // Validação de itens obrigatórios
    const itensPendentes = ITENS_VERIFICACAO.filter((item) => !respostas[item]);
    if (itensPendentes.length > 0) {
      setMensagem({
        tipo: 'erro',
        texto: `Atenção: Responda a todos os itens antes de salvar. Faltam ${itensPendentes.length} item(ns).`,
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

      if (error) {
        throw error;
      }

      setMensagem({ tipo: 'sucesso', texto: 'Checklist salvo com sucesso no banco de dados!' });
      
      // Limpa os campos após o envio
      setOperador('');
      setRespostas({});
      setSupervisaoChecked(false);
      setRegrasChecked({});
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao salvar no banco de dados. Tente novamente ou verifique a tabela do Supabase.',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden p-6 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="border-b border-slate-700 pb-6 mb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Checklist de Operações PDV
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Preencha a verificação operacional do ponto de venda.
          </p>
        </div>

        {/* Notificação */}
        {mensagem && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
              mensagem.tipo === 'sucesso'
                ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500 text-rose-400'
            }`}
          >
            <span>{mensagem.texto}</span>
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-8">
          
          {/* Dados do Operador e PDV */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Selecione o PDV
              </label>
              <select
                value={pdv}
                onChange={(e) => setPdv(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {LISTA_PDVS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tipo de Checklist
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Abertura">Abertura</option>
                <option value="Fechamento">Fechamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Nome do Operador
              </label>
              <input
                type="text"
                placeholder="Insira seu nome"
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Lista de Itens com Botoes Conforme / Nao Conforme / N/A */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">
              Itens para Verificação
            </h2>

            <div className="space-y-3">
              {ITENS_VERIFICACAO.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-slate-700/80 gap-3 hover:border-slate-600 transition-all"
                >
                  <span className="text-sm font-medium text-slate-200">{item}</span>

                  <div className="flex gap-2">
                    {[
                      {
                        label: 'Conforme',
                        value: 'Conforme',
                        style:
                          'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
                      },
                      {
                        label: 'Não Conforme',
                        value: 'Não Conforme',
                        style:
                          'peer-checked:bg-rose-600 peer-checked:text-white peer-checked:border-rose-500 hover:bg-rose-500/20 text-rose-400 border-rose-500/40',
                      },
                      {
                        label: 'N/A',
                        value: 'Não se aplica',
                        style:
                          'peer-checked:bg-slate-600 peer-checked:text-white peer-checked:border-slate-400 hover:bg-slate-500/20 text-slate-400 border-slate-600',
                      },
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
                        <span
                          className={`w-full block text-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${opt.style}`}
                        >
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Double Check & Supervisao */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2">
              Double Check Supervisão / Gerência
            </h2>

            <label className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer hover:bg-amber-500/20 transition-all">
              <input
                type="checkbox"
                checked={supervisaoChecked}
                onChange={(e) => setSupervisaoChecked(e.target.checked)}
                className="w-5 h-5 text-amber-500 bg-slate-900 border-slate-600 rounded focus:ring-amber-400"
              />
              <span className="text-sm font-semibold text-amber-300">
                Verificação Supervisão Realizada
              </span>
            </label>

            <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700/80">
              {REGRAS_SUPERVISAO.map((regra, index) => (
                <label key={index} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!regrasChecked[index]}
                    onChange={(e) => handleRegraChange(index, e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-400"
                    required
                  />
                  <span className="text-xs font-medium text-slate-300 leading-relaxed">
                    {regra}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Botão de Finalização */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-center text-sm uppercase tracking-wider"
          >
            {enviando ? 'Salvando no Banco...' : 'Finalizar e Salvar Checklist'}
          </button>
        </form>
      </div>
    </div>
  );
}
