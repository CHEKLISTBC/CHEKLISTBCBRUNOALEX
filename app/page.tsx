'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dvxsqyfmljelxbwtakny.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sNTIaRT4NJmORYin8lp8LQ_ACoj0EO-';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface PDV {
  id: string;
  name: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  requires_supervisor: boolean;
  requires_manager: boolean;
}

export default function ChecklistApp() {
  const [pdvs, setPdvs] = useState<PDV[]>([]);
  const [selectedPdv, setSelectedPdv] = useState<string>('');
  const [shiftType, setShiftType] = useState<'abertura' | 'fechamento'>('abertura');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  
  const [operatorName, setOperatorName] = useState('');
  const [noPhone, setNoPhone] = useState(false);
  const [cleanUniform, setCleanUniform] = useState(false);
  const [supervisorApproved, setSupervisorApproved] = useState(false);
  const [managerApproved, setManagerApproved] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPdvs();
  }, []);

  useEffect(() => {
    if (selectedPdv) {
      fetchItems();
    }
  }, [selectedPdv, shiftType]);

  async function fetchPdvs() {
    const { data } = await supabase.from('pdvs').select('*');
    if (data) setPdvs(data);
  }

  async function fetchItems() {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('pdv_id', selectedPdv)
      .eq('shift_type', shiftType);
    
    if (data) {
      setItems(data);
      setCheckedItems({});
      setSupervisorApproved(false);
      setManagerApproved(false);
    }
  }

  const handleToggle = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasSupervisorReq = items.some(i => i.requires_supervisor);
  const hasManagerReq = items.some(i => i.requires_manager);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!operatorName.trim()) {
      alert('Por favor, informe o nome do operador.');
      return;
    }
    if (!noPhone || !cleanUniform) {
      alert('É necessário confirmar os termos de regra interna.');
      return;
    }
    if (hasSupervisorReq && !supervisorApproved) {
      alert('Double Check da Supervisão é obrigatório para este checklist.');
      return;
    }
    if (hasManagerReq && !managerApproved) {
      alert('Double Check da Gerência A&B é obrigatório para este checklist.');
      return;
    }

    setLoading(true);
    setMessage('');
    
    const { data: subData, error: subError } = await supabase
      .from('submissions')
      .insert([{
        pdv_id: selectedPdv,
        shift_type: shiftType,
        operator_name: operatorName,
        uniform_agreed: cleanUniform,
        no_phone_agreed: noPhone,
        supervisor_approved: supervisorApproved,
        manager_approved: managerApproved
      }])
      .select();

    if (subError || !subData) {
      setMessage('Erro ao salvar no banco.');
      setLoading(false);
      return;
    }

    const itemsToInsert = items.map(item => ({
      submission_id: subData[0].id,
      task: item.task,
      completed: !!checkedItems[item.id]
    }));

    await supabase.from('submission_items').insert(itemsToInsert);

    setLoading(false);
    setMessage('Checklist finalizado e enviado com sucesso!');
    setOperatorName('');
    setCheckedItems({});
    setNoPhone(false);
    setCleanUniform(false);
    setSupervisorApproved(false);
    setManagerApproved(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Check list de Operaçoes PDV</h1>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300 font-medium text-center">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Selecione o PDV:</label>
            <select 
              value={selectedPdv} 
              onChange={e => setSelectedPdv(e.target.value)}
              className="w-full border rounded p-2 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecione --</option>
              {pdvs.map(pdv => (
                <option key={pdv.id} value={pdv.id}>{pdv.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de Checklist:</label>
            <select 
              value={shiftType} 
              onChange={e => setShiftType(e.target.value as 'abertura' | 'fechamento')}
              className="w-full border rounded p-2 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="abertura">Abertura</option>
              <option value="fechamento">Fechamento</option>
            </select>
          </div>
        </div>

        {selectedPdv && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-1">Nome do Operador:</label>
              <input 
                type="text" 
                value={operatorName} 
                onChange={e => setOperatorName(e.target.value)} 
                className="w-full border rounded p-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Insira seu nome" 
              />
            </div>

            <div className="border rounded-md overflow-hidden border-gray-300">
              <div className="bg-gray-200 px-4 py-2 font-bold text-sm text-gray-700">Itens para Verificação</div>
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <label key={item.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!checkedItems[item.id]} 
                      onChange={() => handleToggle(item.id)}
                      className="h-5 w-5 text-blue-600 rounded" 
                    />
                    <span className="ml-3 text-sm text-gray-800">{item.task}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-300 space-y-3">
              <span className="font-bold text-sm block text-gray-700">DOUBLE CHECK SUPERVISÃO / GERÊNCIA</span>
              {hasSupervisorReq && (
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={supervisorApproved} 
                    onChange={e => setSupervisorApproved(e.target.checked)}
                    className="h-4 w-4 text-blue-600" 
                  />
                  <span className="ml-2 text-sm font-semibold text-gray-800">Verificação Supervisão</span>
                </label>
              )}
              {hasManagerReq && (
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={managerApproved} 
                    onChange={e => setManagerApproved(e.target.checked)}
                    className="h-4 w-4 text-blue-600" 
                  />
                  <span className="ml-2 text-sm font-semibold text-gray-800">Verificação Gerente A&B</span>
                </label>
              )}
            </div>

            <div className="bg-red-600 text-white p-4 rounded-md space-y-2 text-sm font-bold">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={noPhone} 
                  onChange={e => setNoPhone(e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded bg-white" 
                />
                <span className="ml-2">PROIBIDO uso de celular no local de trabalho e qualquer tipo de aparelho sonoro.</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={cleanUniform} 
                  onChange={e => setCleanUniform(e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded bg-white" 
                />
                <span className="ml-2">Estou ciente de que o uniforme deve estar bem limpo e passado.</span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Finalizar e Salvar Checklist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';

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
  const [pdv, setPdv] = useState('Caipirodromo');
  const [tipo, setTipo] = useState('Abertura');
  const [operador, setOperador] = useState('');
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [verificacaoSupervisao, setVerificacaoSupervisao] = useState(false);

  const handleOptionChange = (item: string, valor: string) => {
    setRespostas((prev) => ({ ...prev, [item]: valor }));
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Checklist salvo com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
        
        {/* Cabeçalho */}
        <div className="border-b pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Checklist de Operações PDV
          </h1>
          <p className="text-sm text-slate-500 mt-1">Preencha os dados e a verificação de rotina.</p>
        </div>

        <form onSubmit={handleSalvar} className="space-y-6">
          
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Selecione o PDV</label>
              <select 
                value={pdv} 
                onChange={(e) => setPdv(e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 border"
              >
                <option value="Caipirodromo">Caipirodromo</option>
                <option value="Bar Central">Bar Central</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Checklist</label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm p-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 border"
              >
                <option value="Abertura">Abertura</option>
                <option value="Fechamento">Fechamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nome do Operador</label>
              <input 
                type="text" 
                placeholder="Insira seu nome" 
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
                className="w-full border-slate-300 rounded-md shadow-sm p-2 text-sm focus:ring-2 focus:ring-blue-500 border"
                required
              />
            </div>
          </div>

          {/* Itens para Verificação */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Itens para Verificação</h2>
            <div className="space-y-3">
              {ITENS_VERIFICACAO.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 gap-2">
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                  
                  <div className="flex gap-1 sm:gap-2">
                    {[
                      { label: 'Conforme', value: 'C', color: 'peer-checked:bg-emerald-600 peer-checked:text-white hover:bg-emerald-50 text-emerald-700 border-emerald-300' },
                      { label: 'Não Conforme', value: 'NC', color: 'peer-checked:bg-rose-600 peer-checked:text-white hover:bg-rose-50 text-rose-700 border-rose-300' },
                      { label: 'N/A', value: 'NA', color: 'peer-checked:bg-slate-600 peer-checked:text-white hover:bg-slate-100 text-slate-600 border-slate-300' },
                    ].map((opt) => (
                      <label key={opt.value} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name={`item-${index}`} 
                          value={opt.value}
                          checked={respostas[item] === opt.value}
                          onChange={() => handleOptionChange(item, opt.value)}
                          className="peer hidden" 
                        />
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded border transition-all inline-block ${opt.color}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Double Check / Supervisão */}
          <div className="pt-2">
            <h2 className="text-lg font-bold text-slate-900 mb-3 border-b pb-2">Double Check / Supervisão / Gerência</h2>
            
            <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer mb-4">
              <input 
                type="checkbox" 
                checked={verificacaoSupervisao}
                onChange={(e) => setVerificacaoSupervisao(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" 
              />
              <span className="text-sm font-semibold text-amber-900">Verificação Supervisão</span>
            </label>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              {REGRAS_SUPERVISAO.map((regra, index) => (
                <label key={index} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500" required />
                  <span className="text-xs font-medium text-slate-600">{regra}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botão de Envio */}
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors text-center text-sm"
          >
            Finalizar e Salvar Checklist
          </button>
        </form>
      </div>
    </div>
  );
}
