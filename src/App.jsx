import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Cpu, Grid, Type, Check, AlertCircle, Plus, Trash2, SlidersHorizontal, BookOpen, Share2, MousePointer2, List, Code, Download, Upload } from 'lucide-react';
import TuringMachineSimulator from './components/TuringMachineSimulator';
import CantorDiagonalization from './components/CantorDiagonalization';
import UniversalTuringMachine from './components/UniversalTuringMachine';
import AutomataSimulator from './components/AutomataSimulator';
import AutomataCanvas from './components/VisualAutomataEditor/AutomataCanvas';
import NavButton from './components/NavButton';
import SymbolPickerInput from './components/SymbolPickerInput';
import useLocalStorage from './hooks/useLocalStorage';
import { TM_EXAMPLES, UTM_EXAMPLES, AUTOMATA_EXAMPLES } from './constants/examples';
import { convertTmArrayToObject } from './utils/tmUtils';

export default function TheoryOfComputationHub() {
  const [activeTab, setActiveTab] = useLocalStorage('toc-active-tab', 'turing');
  const [showConfig, setShowConfig] = useState(false);
  const [editorMode, setEditorMode] = useLocalStorage('toc-auto-editor-mode', 'visual');
  const [showJsonPanel, setShowJsonPanel] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

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
      setShowJsonPanel(false);
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

  const handleLoadJson = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (activeTab === 'turing') {
        if (data.rules) setEditingTmRules(data.rules);
        if (data.input) setEditingTmInput(data.input);
        if (data.accept) setEditingTmAccept(data.accept);
      } else if (activeTab === 'utm') {
        if (data.rules) setEditingUtmRules(data.rules);
        if (data.data) setEditingUtmData(Array.isArray(data.data) ? data.data.join(', ') : data.data);
      } else if (activeTab === 'automata') {
        if (data.type) setEditingAutoType(data.type);
        if (data.initialState) setEditingAutoInitial(data.initialState);
        if (data.acceptStates) setEditingAutoAccept(Array.isArray(data.acceptStates) ? data.acceptStates.join(', ') : data.acceptStates);
        if (data.transitions) setEditingAutoTransitions(data.transitions);
        if (data.input) setEditingAutoInput(data.input);
      }
      setShowJsonPanel(false);
      setError('');
    } catch (err) {
      setError("Erro no JSON: " + err.message);
    }
  };

  const handleExportJson = () => {
    let obj = {};
    if (activeTab === 'turing') {
      obj = { rules: editingTmRules, input: editingTmInput, accept: editingTmAccept };
    } else if (activeTab === 'utm') {
      obj = { rules: editingUtmRules, data: editingUtmData.split(',').map(s => s.trim()) };
    } else if (activeTab === 'automata') {
      obj = { type: editingAutoType, initialState: editingAutoInitial, acceptStates: editingAutoAccept.split(',').map(s => s.trim()), transitions: editingAutoTransitions, input: editingAutoInput };
    }
    setJsonInput(JSON.stringify(obj, null, 2));
    setShowJsonPanel(true);
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
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <Cpu className="text-purple-600" />
            <span className="tracking-tight">ToC Visualizer</span>
          </div>
          
          <div className="flex gap-1 bg-slate-50 p-1 rounded border border-slate-200 overflow-x-auto max-w-full">
            <NavButton active={activeTab === 'turing'} onClick={() => { setActiveTab('turing'); setShowConfig(false); }} icon={<Type size={16} />} label="M. Turing" />
            <NavButton active={activeTab === 'utm'} onClick={() => { setActiveTab('utm'); setShowConfig(false); }} icon={<Cpu size={16} />} label="MTU" />
            <NavButton active={activeTab === 'automata'} onClick={() => { setActiveTab('automata'); setShowConfig(false); }} icon={<Share2 size={16} />} label="Autômatos" />
            <NavButton active={activeTab === 'cantor'} onClick={() => { setActiveTab('cantor'); setShowConfig(false); }} icon={<Grid size={16} />} label="Cantor" />
          </div>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-all font-medium border shadow-sm ${
              showConfig ? 'bg-purple-600 border-purple-700 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            <Settings size={18} />
            {showConfig ? 'Fechar Edição' : 'Configurar'}
          </button>
        </div>
      </nav>

      {/* Painel de Configuração */}
      {showConfig && (
        <div className="border-b border-slate-200 bg-slate-50 p-6 shadow-inner relative z-40">
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-purple-600" /> 
                Configurando: {
                  activeTab === 'turing' ? 'Máquina de Turing' : 
                  activeTab === 'utm' ? 'Máquina Universal' : 
                  activeTab === 'automata' ? 'Autômatos (DFA/NFA)' : 
                  'Diagonalização'
                }
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportJson}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-600 hover:text-slate-900 px-4 py-2 rounded font-bold text-sm transition-all shadow-sm"
                >
                  <Code size={16} /> JSON
                </button>
                <button onClick={handleApplyConfig} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-bold text-sm transition-all shadow-sm">
                  <Check size={18} /> Aplicar Alterações
                </button>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center gap-2 font-medium text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {/* Painel JSON Laboratory */}
            {showJsonPanel && (
              <div className="bg-white rounded border border-slate-200 p-4 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    <Code size={14} /> Laboratório JSON
                  </div>
                  <button onClick={() => setShowJsonPanel(false)} className="text-slate-400 hover:text-slate-600"><Trash2 size={14} /></button>
                </div>
                <textarea 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Cole seu JSON aqui... {"rules": [...]}'
                  className="w-full h-40 bg-slate-50 border border-slate-200 rounded p-3 font-mono text-xs text-slate-700 focus:border-purple-400 outline-none"
                />
                <button 
                  onClick={handleLoadJson}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                >
                  <Upload size={14} /> Carregar no Editor
                </button>
              </div>
            )}

            {/* Padrões Prontos */}
            <div className="bg-white rounded border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <BookOpen size={16} /> Exemplos:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTab === 'turing' && Object.entries(TM_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadTmExample(key)} className="px-3 py-1 text-xs bg-slate-50 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded border border-slate-200 hover:border-purple-200 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'utm' && Object.entries(UTM_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadUtmExample(key)} className="px-3 py-1 text-xs bg-slate-50 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded border border-slate-200 hover:border-purple-200 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'automata' && Object.entries(AUTOMATA_EXAMPLES).map(([key, ex]) => (
                  <button key={key} onClick={() => loadAutoExample(key)} className="px-3 py-1 text-xs bg-slate-50 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded border border-slate-200 hover:border-purple-200 transition-colors">
                    {ex.name}
                  </button>
                ))}
                {activeTab === 'cantor' && [4, 8, 16].map(size => (
                  <button key={size} onClick={() => { setEditingCantorSize(size); setCantorSize(size); setShowConfig(false); }} className="px-3 py-1 text-xs bg-slate-50 hover:bg-purple-100 hover:text-purple-700 text-slate-600 rounded border border-slate-200 hover:border-purple-200 transition-colors">
                    Matriz {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuração Autômatos */}
            {activeTab === 'automata' && (
              <div className="space-y-4">
                <div className="flex gap-1 bg-white p-1 rounded border border-slate-200 w-fit mb-4 shadow-sm">
                  <button 
                    onClick={() => setEditorMode('visual')} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${editorMode === 'visual' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <MousePointer2 size={14} /> Editor Visual (Grafo)
                  </button>
                  <button 
                    onClick={() => setEditorMode('manual')} 
                    className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all ${editorMode === 'manual' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <List size={14} /> Tabela Manual
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Máquina</label>
                    <select value={editingAutoType} onChange={(e) => setEditingAutoType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm text-slate-800 outline-none focus:border-purple-400">
                      <option value="DFA">Determinístico (DFA)</option>
                      <option value="NFA">Não-Determinístico (NFA)</option>
                    </select>
                  </div>
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado Inicial</label>
                    <input type="text" value={editingAutoInitial} onChange={(e) => setEditingAutoInitial(e.target.value)} disabled={editorMode === 'visual'} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400 disabled:opacity-50" />
                  </div>
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estados de Aceitação</label>
                    <input type="text" value={editingAutoAccept} onChange={(e) => setEditingAutoAccept(e.target.value)} disabled={editorMode === 'visual'} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400 disabled:opacity-50" placeholder="q1, q2" />
                  </div>
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cadeia Padrão</label>
                    <input type="text" value={editingAutoInput} onChange={(e) => setEditingAutoInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400" />
                  </div>
                </div>

                {editorMode === 'manual' && (
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm overflow-x-auto">
                    <table className="w-full text-xs text-left mb-4">
                      <thead className="text-slate-400 border-b border-slate-100">
                        <tr><th className="pb-2 font-bold uppercase tracking-wider">Estado Atual</th><th className="pb-2 font-bold uppercase tracking-wider">Lê</th><th className="pb-2 font-bold uppercase tracking-wider">Estado(s) Destino</th><th className="pb-2 font-bold uppercase tracking-wider text-center">Remover</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {editingAutoTransitions.map((rule, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 pr-2"><input type="text" value={rule.from} onChange={(e) => {const n=[...editingAutoTransitions]; n[idx].from=e.target.value; setEditingAutoTransitions(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" /></td>
                            <td className="py-2 pr-2">
                              <SymbolPickerInput 
                                value={rule.symbol} 
                                onChange={(val) => {const n=[...editingAutoTransitions]; n[idx].symbol=val; setEditingAutoTransitions(n);}} 
                                className="w-20 bg-white border border-slate-200 rounded p-1 text-purple-600 font-bold text-center outline-none focus:border-purple-400" 
                              />
                            </td>
                            <td className="py-2 pr-2"><input type="text" value={rule.to} onChange={(e) => {const n=[...editingAutoTransitions]; n[idx].to=e.target.value; setEditingAutoTransitions(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" placeholder="q1,q2" /></td>
                            <td className="py-2 text-center"><button onClick={() => setEditingAutoTransitions(editingAutoTransitions.filter((_, i) => i !== idx))} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button onClick={() => setEditingAutoTransitions([...editingAutoTransitions, { from: 'q0', symbol: '0', to: 'q1' }])} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors px-2 py-1"><Plus size={14} /> Nova Transição</button>
                  </div>
                )}
              </div>
            )}

            {/* Configuração TM */}
            {activeTab === 'turing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cadeia Inicial Padrão</label>
                    <input type="text" value={editingTmInput} onChange={(e) => setEditingTmInput(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400" />
                  </div>
                  <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Estado de Aceitação</label>
                    <input type="text" value={editingTmAccept} onChange={(e) => setEditingTmAccept(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400" />
                  </div>
                </div>

                <div className="bg-white rounded border border-slate-200 p-4 shadow-sm overflow-x-auto">
                  <table className="w-full text-xs text-left mb-4">
                    <thead className="text-slate-400 border-b border-slate-100">
                      <tr><th className="pb-2 font-bold uppercase tracking-wider">Estado Atual</th><th className="pb-2 font-bold uppercase tracking-wider">Lê</th><th className="pb-2 font-bold uppercase tracking-wider">Novo Estado</th><th className="pb-2 font-bold uppercase tracking-wider">Escreve</th><th className="pb-2 font-bold uppercase tracking-wider">Movimento</th><th className="pb-2 font-bold uppercase tracking-wider text-center">Remover</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {editingTmRules.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 pr-2"><input type="text" value={rule.currentState} onChange={(e) => {const n=[...editingTmRules]; n[idx].currentState=e.target.value; setEditingTmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><SymbolPickerInput value={rule.readSymbol} onChange={(val) => {const n=[...editingTmRules]; n[idx].readSymbol=val; setEditingTmRules(n);}} className="w-16 bg-white border border-slate-200 rounded p-1 text-purple-600 font-bold text-center outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.nextState} onChange={(e) => {const n=[...editingTmRules]; n[idx].nextState=e.target.value; setEditingTmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><SymbolPickerInput value={rule.writeSymbol} onChange={(val) => {const n=[...editingTmRules]; n[idx].writeSymbol=val; setEditingTmRules(n);}} className="w-16 bg-white border border-slate-200 rounded p-1 text-purple-600 font-bold text-center outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2">
                            <select value={rule.move} onChange={(e) => {const n=[...editingTmRules]; n[idx].move=e.target.value; setEditingTmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400">
                              <option value="D">D</option><option value="E">E</option><option value="P">P</option>
                            </select>
                          </td>
                          <td className="py-2 text-center"><button onClick={() => setEditingTmRules(editingTmRules.filter((_, i) => i !== idx))} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setEditingTmRules([...editingTmRules, { currentState: 'q0', readSymbol: '', nextState: 'q1', writeSymbol: '', move: 'D' }])} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors px-2 py-1"><Plus size={14} /> Nova Regra</button>
                </div>
              </div>
            )}

            {/* Configuração MTU */}
            {activeTab === 'utm' && (
              <div className="space-y-4">
                <div className="bg-white rounded border border-slate-200 p-4 shadow-sm overflow-x-auto">
                  <table className="w-full text-xs text-left mb-4">
                    <thead className="text-slate-400 border-b border-slate-100">
                      <tr><th className="pb-2 font-bold uppercase tracking-wider">Estado</th><th className="pb-2 font-bold uppercase tracking-wider">Lê</th><th className="pb-2 font-bold uppercase tracking-wider">Novo Estado</th><th className="pb-2 font-bold uppercase tracking-wider">Escreve</th><th className="pb-2 font-bold uppercase tracking-wider">Movimento</th><th className="pb-2 font-bold uppercase tracking-wider text-center">Remover</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {editingUtmRules.map((rule, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 pr-2"><input type="text" value={rule.fromS} onChange={(e) => {const n=[...editingUtmRules]; n[idx].fromS=e.target.value; setEditingUtmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><SymbolPickerInput value={rule.read} onChange={(val) => {const n=[...editingUtmRules]; n[idx].read=val; setEditingUtmRules(n);}} className="w-16 bg-white border border-slate-200 rounded p-1 text-purple-600 font-bold text-center outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><input type="text" value={rule.toS} onChange={(e) => {const n=[...editingUtmRules]; n[idx].toS=e.target.value; setEditingUtmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2"><SymbolPickerInput value={rule.write} onChange={(val) => {const n=[...editingUtmRules]; n[idx].write=val; setEditingUtmRules(n);}} className="w-16 bg-white border border-slate-200 rounded p-1 text-purple-600 font-bold text-center outline-none focus:border-purple-400" /></td>
                          <td className="py-2 pr-2">
                            <select value={rule.move} onChange={(e) => {const n=[...editingUtmRules]; n[idx].move=e.target.value; setEditingUtmRules(n);}} className="w-full bg-white border border-slate-200 rounded p-1 text-slate-800 outline-none focus:border-purple-400">
                              <option value="D">D</option><option value="E">E</option><option value="P">P</option>
                            </select>
                          </td>
                          <td className="py-2 text-center"><button onClick={() => setEditingUtmRules(editingUtmRules.filter((_, i) => i !== idx))} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => setEditingUtmRules([...editingUtmRules, { fromS: 'q0', read: '', toS: 'q1', write: '', move: 'D' }])} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors px-2 py-1"><Plus size={14} /> Nova Regra</button>
                </div>
                <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fita Inicial (Lógica)</label>
                  <input type="text" value={editingUtmData} onChange={(e) => setEditingUtmData(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-400" placeholder="1, 0, 1, β" />
                </div>
              </div>
            )}

            {/* Configuração Cantor */}
            {activeTab === 'cantor' && (
              <div className="bg-white rounded border border-slate-200 p-4 shadow-sm max-w-md">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tamanho da Matriz</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="2" max="20" value={editingCantorSize} onChange={(e) => setEditingCantorSize(e.target.value)} className="flex-1 accent-purple-600" />
                  <span className="font-mono text-sm bg-slate-100 border border-slate-200 px-3 py-1 rounded text-slate-700">{editingCantorSize}x{editingCantorSize}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Área Principal */}
      <main key={activeTab} className="max-w-7xl mx-auto p-6 relative z-10 min-h-[calc(100vh-80px)] animate-fade-in-up">
        {activeTab === 'turing' && <TuringMachineSimulator transitions={convertTmArrayToObject(tmRules)} acceptState={tmAccept} initialState="q0" initialInput={tmInput} onInputChange={setTmInput} />}
        {activeTab === 'utm' && <UniversalTuringMachine programRules={utmRules} initialData={utmInitialData} />}
        {activeTab === 'automata' && (
          <div className="space-y-8 animate-fade-in">
            {editorMode === 'visual' && <AutomataCanvas onSync={handleVisualSync} />}
            <AutomataSimulator type={autoType} transitions={autoTransitions} initialState={autoInitial} acceptStates={autoAccept} initialInput={autoInput} onInputChange={setAutoInput} />
          </div>
        )}
        {activeTab === 'cantor' && <CantorDiagonalization matrixSize={cantorSize} />}
      </main>

      <footer className="max-w-7xl mx-auto p-12 text-center border-t border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.2em] space-y-2">
        <p>Theory of Computation Visualizer &bull; Modular Research Environment</p>
        <p className="normal-case tracking-normal text-xs">
          Desenvolvido por <a href="https://www.linkedin.com/in/gustavo-tamiosso/" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-bold hover:underline">Gustavo Lopes Tamiosso</a>
        </p>
      </footer>
    </div>
  );
}
