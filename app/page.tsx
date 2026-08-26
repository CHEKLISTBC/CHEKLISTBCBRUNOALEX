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
