import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Cpu, Grid, Type, Check, AlertCircle, Plus, Trash2, SlidersHorizontal, BookOpen, Share2, MousePointer2, List } from 'lucide-react';
import TuringMachineSimulator from './components/TuringMachineSimulator';
import CantorDiagonalization from './components/CantorDiagonalization';
import UniversalTuringMachine from './components/UniversalTuringMachine';
import AutomataSimulator from './components/AutomataSimulator';
import AutomataCanvas from './components/VisualAutomataEditor/AutomataCanvas';
import NavButton from './components/NavButton';
import useLocalStorage from './hooks/useLocalStorage';
import { TM_EXAMPLES, UTM_EXAMPLES, AUTOMATA_EXAMPLES } from './constants/examples';
import { convertTmArrayToObject } from './utils/tmUtils';

export default function TheoryOfComputationHub() {
  const [activeTab, setActiveTab] = useLocalStorage('toc-active-tab', 'turing');
  const [showConfig, setShowConfig] = useState(false);
  const [editorMode, setEditorMode] = useLocalStorage('toc-auto-editor-mode', 'visual');

  // Estados Ativos
  const [tmRules, setTmRules] = useLocalStorage('toc-tm-rules', TM_EXAMPLES.parity.rules);
  const [tmInput, setTmInput] = useLocalStorage('toc-tm-input', TM_EXAMPLES.parity.input);
  const [tmAccept, setTmAccept] = useLocalStorage('toc-tm-accept', TM_EXAMPLES.parity.accept);
  
  const [utmRules, setUtmRules] = useLocalStorage('toc-utm-rules', UTM_EXAMPLES.inverter.rules);
  const [utmInitialData, setUtmInitialData] = useLocalStorage('toc-utm-data', UTM_EXAMPLES.inverter.data);
  const [cantorSize, setCantorSize] = useLocalStorage('toc-cantor-size', 8);

  const [autoType, setAutoType] = useLocalStorage('toc-auto-type', 'DFA');
  const [autoInitial, setAutoInitial] = useLocalStorage('toc-auto-initial', 'q0');
  const [autoAccept, setAutoAccept] = useLocalStorage('toc-auto-accept', ['q2']);
  const [autoTransitions, setAutoTransitions] = useLocalStorage('toc-auto-transitions', AUTOMATA_EXAMPLES.dfa_ends_01.transitions);
  const [autoInput, setAutoInput] = useLocalStorage('toc-auto-input', '1101');

  // Estados de Edição Temporária
  const [editingTmRules, setEditingTmRules] = useState([]);
  const [editingTmInput, setEditingTmInput] = useState('');
  const [editingTmAccept, setEditingTmAccept] = useState('');
  
  const [editingUtmRules, setEditingUtmRules] = useState([]);
  const [editingUtmData, setEditingUtmData] = useState('');
  const [editingCantorSize, setEditingCantorSize] = useState(8);

  const [editingAutoType, setEditingAutoType] = useState('DFA');
  const [editingAutoInitial, setEditingAutoInitial] = useState('q0');
  const [editingAutoAccept, setEditingAutoAccept] = useState('');
  const [editingAutoTransitions, setEditingAutoTransitions] = useState([]);
  const [editingAutoInput, setEditingAutoInput] = useState('');

  const [error, setError] = useState('');

  // Ao abrir as configurações, puxa os dados salvos
  useEffect(() => {
    if (showConfig) {
      setEditingTmRules(JSON.parse(JSON.stringify(tmRules)));
      setEditingTmInput(tmInput);
      setEditingTmAccept(tmAccept);
      
      setEditingUtmRules(JSON.parse(JSON.stringify(utmRules)));
      setEditingUtmData(utmInitialData.join(', '));
      setEditingCantorSize(cantorSize);

      setEditingAutoType(autoType);
      setEditingAutoInitial(autoInitial);
      setEditingAutoAccept(autoAccept.join(', '));
      setEditingAutoTransitions(JSON.parse(JSON.stringify(autoTransitions)));
      setEditingAutoInput(autoInput);

      setError('');
    }
  }, [showConfig, tmRules, tmInput, tmAccept, utmRules, utmInitialData, cantorSize, autoType, autoInitial, autoAccept, autoTransitions, autoInput]);

  const handleApplyConfig = () => {
    try {
      if (activeTab === 'turing') {
        if (editingTmRules.length === 0) throw new Error("TM: Adicione pelo menos uma regra.");
        setTmRules(editingTmRules);
        setTmInput(editingTmInput);
        setTmAccept(editingTmAccept);
      } else if (activeTab === 'utm') {
        const parsedUtmData = editingUtmData.split(',').map(s => s.trim()).filter(s => s !== '');
        if (parsedUtmData.length === 0) throw new Error("MTU: A fita não pode estar vazia.");
        if (editingUtmRules.length === 0) throw new Error("MTU: Adicione pelo menos uma regra.");
        setUtmRules(editingUtmRules);
        setUtmInitialData(parsedUtmData);
      } else if (activeTab === 'cantor') {
        const size = parseInt(editingCantorSize);
        if (isNaN(size) || size < 2 || size > 20) throw new Error("Cantor: Tamanho deve ser entre 2 e 20.");
        setCantorSize(size);
      } else if (activeTab === 'automata') {
        if (editingAutoTransitions.length === 0) throw new Error("Autômato: Adicione pelo menos uma transição.");
        const acceptList = editingAutoAccept.split(',').map(s => s.trim()).filter(s => s !== '');
        if (acceptList.length === 0) throw new Error("Autômato: Defina pelo menos um estado de aceitação.");
        
        setAutoType(editingAutoType);
        setAutoInitial(editingAutoInitial);
        setAutoAccept(acceptList);
        setAutoTransitions(editingAutoTransitions);
        setAutoInput(editingAutoInput);
      }
      
      setError('');
      setShowConfig(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTmExample = (key) => {
    const ex = TM_EXAMPLES[key];
    setTmRules(ex.rules);
    setTmInput(ex.input);
    setTmAccept(ex.accept);
    setShowConfig(false);
  };

  const loadUtmExample = (key) => {
    const ex = UTM_EXAMPLES[key];
    setUtmRules(ex.rules);
    setUtmInitialData(ex.data);
    setShowConfig(false);
  };

  const loadAutoExample = (key) => {
    const ex = AUTOMATA_EXAMPLES[key];
    setAutoType(ex.type);
    setAutoInitial(ex.initialState);
    setAutoAccept(ex.acceptStates);
    setAutoTransitions(ex.transitions);
    setAutoInput(ex.input);
    setShowConfig(false);
  };

  const handleVisualSync = useCallback((data) => {
    if (editorMode === 'visual') {
      setAutoInitial(data.initialState);
      setAutoAccept(data.acceptStates);
      setAutoTransitions(data.transitions);
    }
  }, [editorMode, setAutoInitial, setAutoAccept, setAutoTransitions]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="bg-[#0f172a] border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Cpu className="text-blue-500" />
            <span>ToC Visualizer</span>
          </div>
          
          <div className="flex gap-2 bg-[#020617] p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <NavButton active={activeTab === 'turing'} onClick={() => { setActiveTab('turing'); setShowConfig(false); }} icon={<Type size={16} />} label="M. Turing" />
            <NavButton active={activeTab === 'utm'} onClick={() => { setActiveTab('utm'); setShowConfig(false); }} icon={<Cpu size={16} />} label="MTU" />
            <NavButton active={activeTab === 'automata'} onClick={() => { setActiveTab('automata'); setShowConfig(false); }} icon={<Share2 size={16} />} label="Autômatos" />
            <NavButton active={activeTab === 'cantor'} onClick={() => { setActiveTab('cantor'); setShowConfig(false); }} icon={<Grid size={16} />} label="Cantor" />
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium border ${
              showConfig ? 'bg-slate-800 border-slate-600 text-white' : 'bg-[#0f172a] border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings size={18} />
            {showConfig ? 'Fechar Edição' : 'Configurar Ferramenta'}
          </button>
        </div>
      </nav>

      {/* Painel de Configuração */}
      {showConfig && (
        <div className="border-b border-slate-800 bg-[#0f172a] p-6 shadow-inner relative z-40">
          <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={24} className="text-blue-400" /> 
                Configurando: {
                  activeTab === 'turing' ? 'Máquina de Turing' : 
                  activeTab === 'utm' ? 'Máquina Universal' : 
                  activeTab === 'automata' ? 'Autômatos (DFA/NFA)' : 
                  'Diagonalização'
                }
              </h2>
              <button onClick={handleApplyConfig} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <Check size={18} /> Salvar e Aplicar
              </button>
            </div>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 font-medium">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {/* Padrões Prontos */}
            <div className="bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold uppercase tracking-wider text-sm">
                <BookOpen size={18} /> Padrões Prontos:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTab === 'turing' && Object.entries(TM_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadTmExample(key)} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded border border-slate-700 hover:border-blue-500 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'utm' && Object.entries(UTM_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadUtmExample(key)} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 rounded border border-slate-700 hover:border-purple-500 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'automata' && Object.entries(AUTOMATA_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadAutoExample(key)} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded border border-slate-700 hover:border-blue-500 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'cantor' && [4, 8, 16].map(size => (
                  <button key={size} onClick={() => { setEditingCantorSize(size); setCantorSize(size); setShowConfig(false); }} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 rounded border border-slate-700 hover:border-green-500 transition-colors">
                    Matriz {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuração Autômatos */}
            {activeTab === 'automata' && (
              <div className="space-y-4">
                <div className="flex gap-2 bg-[#020617] p-1 rounded-lg border border-slate-800 w-fit mb-4">
                  <button 
                    onClick={() => setEditorMode('visual')} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${editorMode === 'visual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <MousePointer2 size={14} /> Editor Visual (Grafo)
                  </button>
                  <button 
                    onClick={() => setEditorMode('manual')} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${editorMode === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <List size={14} /> Tabela de Transições
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Tipo</label>
                    <select value={editingAutoType} onChange={(e) => setEditingAutoType(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none">
                      <option value="DFA">Determinístico (DFA)</option>
                      <option value="NFA">Não-Determinístico (NFA)</option>
                    </select>
                  </div>
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Estado Inicial</label>
                    <input type="text" value={editingAutoInitial} onChange={(e) => setEditingAutoInitial(e.target.value)} disabled={editorMode === 'visual'} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm font-mono text-slate-200 outline-none disabled:opacity-50" />
                  </div>
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Estados de Aceitação</label>
                    <input type="text" value={editingAutoAccept} onChange={(e) => setEditingAutoAccept(e.target.value)} disabled={editorMode === 'visual'} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm font-mono text-slate-200 outline-none disabled:opacity-50" placeholder="q1, q2" />
                  </div>
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Cadeia Padrão</label>
                    <input type="text" value={editingAutoInput} onChange={(e) => setEditingAutoInput(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-sm font-mono text-slate-200 outline-none" />
                  </div>
                </div>

                {editorMode === 'manual' && (
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-left mb-4">
                      <thead className="text-slate-500 border-b border-slate-800">
                        <tr><th className="pb-2 font-medium">Estado Atual</th><th className="pb-2 font-medium">Lê (ε para vazio)</th><th className="pb-2 font-medium">Estado(s) Destino</th><th className="pb-2 font-medium text-center">Ação</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {editingAutoTransitions.map((rule, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="py-2 pr-2"><input type="text" value={rule.from} onChange={(e) => {const n=[...editingAutoTransitions]; n[idx].from=e.target.value; setEditingAutoTransitions(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none" /></td>
                            <td className="py-2 pr-2"><input type="text" value={rule.symbol} onChange={(e) => {const n=[...editingAutoTransitions]; n[idx].symbol=e.target.value; setEditingAutoTransitions(n);}} className="w-24 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-blue-400 font-bold text-center outline-none" /></td>
                            <td className="py-2 pr-2"><input type="text" value={rule.to} onChange={(e) => {const n=[...editingAutoTransitions]; n[idx].to=e.target.value; setEditingAutoTransitions(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none" placeholder="Para NFA use vírgula: q1,q2" /></td>
                            <td className="py-2 text-center"><button onClick={() => setEditingAutoTransitions(editingAutoTransitions.filter((_, i) => i !== idx))} className="p-1.5 text-slate-500 hover:text-red-400 rounded"><Trash2 size={16} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => setEditingAutoTransitions([...editingAutoTransitions, { from: 'q0', symbol: '0', to: 'q1' }])} className="flex items-center gap-2 text-sm bg-[#0f172a] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg"><Plus size={16} /> Nova Transição</button>
                  </div>
                )}

                {editorMode === 'visual' && (
                  <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4 text-blue-400 text-sm flex items-center gap-3">
                    <MousePointer2 size={20} />
                    <p>O <b>Editor Visual</b> está ativo. As alterações feitas no gráfico abaixo serão sincronizadas automaticamente com o simulador.</p>
                  </div>
                )}
              </div>
            )}

            {/* Configuração TM */}
            {activeTab === 'turing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Cadeia Inicial Padrão</label>
                    <input type="text" value={editingTmInput} onChange={(e) => setEditingTmInput(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200" />
                  </div>
                  <div className="bg-[#020617] rounded-xl border border-slate-800 p-5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Estado de Aceitação</label>
                    <input type="text" value={editingTmAccept} onChange={(e) => setEditingTmAccept(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-200" />
                  </div>
                </div>

                <div className="bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg overflow-x-auto">
                  <table className="w-full text-sm text-left mb-4">
                    <thead className="text-slate-500 border-b border-slate-800">
                      <tr><th className="pb-2 font-medium">Estado Atual</th><th className="pb-2 font-medium">Lê</th><th className="pb-2 font-medium">Novo Estado</th><th className="pb-2 font-medium">Escreve</th><th className="pb-2 font-medium">Movimento</th><th className="pb-2 font-medium text-center">Ação</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {editingTmRules.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-2 pr-2"><input type="text" value={rule.currentState} onChange={(e) => {const n=[...editingTmRules]; n[idx].currentState=e.target.value; setEditingTmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.readSymbol} onChange={(e) => {const n=[...editingTmRules]; n[idx].readSymbol=e.target.value; setEditingTmRules(n);}} className="w-16 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-blue-400 font-bold text-center outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.nextState} onChange={(e) => {const n=[...editingTmRules]; n[idx].nextState=e.target.value; setEditingTmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.writeSymbol} onChange={(e) => {const n=[...editingTmRules]; n[idx].writeSymbol=e.target.value; setEditingTmRules(n);}} className="w-16 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-purple-400 font-bold text-center outline-none" /></td>
                          <td className="py-2 pr-2">
                            <select value={rule.move} onChange={(e) => {const n=[...editingTmRules]; n[idx].move=e.target.value; setEditingTmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none">
                              <option value="D">Direita (D)</option><option value="E">Esquerda (E)</option><option value="P">Parar (P)</option>
                            </select>
                          </td>
                          <td className="py-2 text-center"><button onClick={() => setEditingTmRules(editingTmRules.filter((_, i) => i !== idx))} className="p-1.5 text-slate-500 hover:text-red-400 rounded"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setEditingTmRules([...editingTmRules, { currentState: 'q0', readSymbol: '', nextState: 'q1', writeSymbol: '', move: 'D' }])} className="flex items-center gap-2 text-sm bg-[#0f172a] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg"><Plus size={16} /> Nova Regra</button>
                </div>
              </div>
            )}

            {/* Configuração MTU */}
            {activeTab === 'utm' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg overflow-x-auto">
                  <table className="w-full text-sm text-left mb-4">
                    <thead className="text-slate-500 border-b border-slate-800">
                      <tr><th className="pb-2">Estado</th><th className="pb-2">Lê</th><th className="pb-2">Novo Estado</th><th className="pb-2">Escreve</th><th className="pb-2">Movimento</th><th className="pb-2 text-center">Ação</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {editingUtmRules.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-2 pr-2"><input type="text" value={rule.fromS} onChange={(e) => {const n=[...editingUtmRules]; n[idx].fromS=e.target.value; setEditingUtmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.read} onChange={(e) => {const n=[...editingUtmRules]; n[idx].read=e.target.value; setEditingUtmRules(n);}} className="w-16 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-blue-400 font-bold text-center outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.toS} onChange={(e) => {const n=[...editingUtmRules]; n[idx].toS=e.target.value; setEditingUtmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.write} onChange={(e) => {const n=[...editingUtmRules]; n[idx].write} onChange={(e) => {const n=[...editingUtmRules]; n[idx].write=e.target.value; setEditingUtmRules(n);}} className="w-16 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-purple-400 font-bold text-center outline-none" /></td>
                          <td className="py-2 pr-2">
                            <select value={rule.move} onChange={(e) => {const n=[...editingUtmRules]; n[idx].move=e.target.value; setEditingUtmRules(n);}} className="w-full bg-[#0f172a] border border-slate-700 rounded p-1.5 text-slate-200 outline-none">
                              <option value="D">Direita (D)</option><option value="E">Esquerda (E)</option><option value="P">Parar (P)</option>
                            </select>
                          </td>
                          <td className="py-2 text-center"><button onClick={() => setEditingUtmRules(editingUtmRules.filter((_, i) => i !== idx))} className="p-1.5 text-slate-500 hover:text-red-400 rounded"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setEditingUtmRules([...editingUtmRules, { fromS: 'q0', read: '', toS: 'q1', write: '', move: 'D' }])} className="flex items-center gap-2 text-sm bg-[#0f172a] border border-slate-700 text-slate-300 px-4 py-2 rounded-lg"><Plus size={16} /> Nova Regra</button>
                </div>
                <div className="bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-center">
                  <label className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Fita Inicial (Lógica)</label>
                  <input type="text" value={editingUtmData} onChange={(e) => setEditingUtmData(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 font-mono text-sm text-slate-200 outline-none" placeholder="Ex: 1, 0, 1, β" />
                </div>
              </div>
            )}

            {/* Configuração Cantor */}
            {activeTab === 'cantor' && (
              <div className="bg-[#020617] rounded-xl border border-slate-800 p-5 shadow-lg max-w-md">
                <label className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2 block">Tamanho da Matriz (2 a 20)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="2" max="20" value={editingCantorSize} onChange={(e) => setEditingCantorSize(e.target.value)} className="flex-1 accent-purple-500" />
                  <span className="font-mono text-xl bg-[#0f172a] border border-slate-700 px-4 py-2 rounded text-slate-200">{editingCantorSize}x{editingCantorSize}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Área Principal */}
      <main className="p-6 relative z-10">
        {activeTab === 'turing' && <TuringMachineSimulator transitions={convertTmArrayToObject(tmRules)} acceptState={tmAccept} initialState="q0" initialInput={tmInput} onInputChange={setTmInput} />}
        {activeTab === 'utm' && <UniversalTuringMachine programRules={utmRules} initialData={utmInitialData} />}
        {activeTab === 'automata' && (
          <div className="space-y-10">
            {editorMode === 'visual' && <AutomataCanvas onSync={handleVisualSync} />}
            <AutomataSimulator type={autoType} transitions={autoTransitions} initialState={autoInitial} acceptStates={autoAccept} initialInput={autoInput} onInputChange={setAutoInput} />
          </div>
        )}
        {activeTab === 'cantor' && <CantorDiagonalization matrixSize={cantorSize} />}
      </main>
    </div>
  );
}
