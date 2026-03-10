import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Grid, Type, Check, AlertCircle, Plus, Trash2, SlidersHorizontal, BookOpen } from 'lucide-react';
import TuringMachineSimulator from './TuringMachineSimulator';
import CantorDiagonalization from './CantorDiagonalization';
import UniversalTuringMachine from './UniversalTuringMachine';

// ==========================================
// HOOK DE PERSISTÊNCIA (LOCAL STORAGE)
// ==========================================
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// ==========================================
// BIBLIOTECA DE EXEMPLOS (PADRÕES)
// ==========================================
const TM_EXAMPLES = {
  parity: {
    name: "Paridade (Pares de '1's)",
    input: "1111",
    accept: "q3",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q1', writeSymbol: '©', move: 'D' },
      { currentState: 'q1', readSymbol: '1', nextState: 'q2', writeSymbol: '1', move: 'D' },
      { currentState: 'q2', readSymbol: '1', nextState: 'q1', writeSymbol: '1', move: 'D' },
      { currentState: 'q1', readSymbol: 'β', nextState: 'q3', writeSymbol: 'β', move: 'P' },
    ]
  },
  anbn: {
    name: "Linguagem a^n b^n",
    input: "aabb",
    accept: "q4",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q0_start', writeSymbol: '©', move: 'D' },
      { currentState: 'q0_start', readSymbol: 'a', nextState: 'q1', writeSymbol: 'X', move: 'D' },
      { currentState: 'q1', readSymbol: 'a', nextState: 'q1', writeSymbol: 'a', move: 'D' },
      { currentState: 'q1', readSymbol: 'Y', nextState: 'q1', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q1', readSymbol: 'b', nextState: 'q2', writeSymbol: 'Y', move: 'E' },
      { currentState: 'q2', readSymbol: 'Y', nextState: 'q2', writeSymbol: 'Y', move: 'E' },
      { currentState: 'q2', readSymbol: 'a', nextState: 'q2', writeSymbol: 'a', move: 'E' },
      { currentState: 'q2', readSymbol: 'X', nextState: 'q0_start', writeSymbol: 'X', move: 'D' },
      { currentState: 'q0_start', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q3', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q3', readSymbol: 'β', nextState: 'q4', writeSymbol: 'β', move: 'P' },
    ]
  },
  increment: {
    name: "Incremento Binário (+1)",
    input: "1011",
    accept: "qf",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q1', writeSymbol: '©', move: 'D' },
      { currentState: 'q1', readSymbol: '0', nextState: 'q1', writeSymbol: '0', move: 'D' },
      { currentState: 'q1', readSymbol: '1', nextState: 'q1', writeSymbol: '1', move: 'D' },
      { currentState: 'q1', readSymbol: 'β', nextState: 'q2', writeSymbol: 'β', move: 'E' },
      { currentState: 'q2', readSymbol: '1', nextState: 'q2', writeSymbol: '0', move: 'E' },
      { currentState: 'q2', readSymbol: '0', nextState: 'qf', writeSymbol: '1', move: 'P' },
      { currentState: 'q2', readSymbol: '©', nextState: 'qf', writeSymbol: '1', move: 'P' },
    ]
  }
};

const UTM_EXAMPLES = {
  inverter: {
    name: "Inversor de Bits (NOT)",
    data: ['1', '0', '1', '1', 'β', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: '0', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'q0', write: '1', move: 'D' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  },
  eraser: {
    name: "Apagador (Zera Fita)",
    data: ['1', '1', '0', '1', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: 'β', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'q0', write: 'β', move: 'D' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  },
  findZero: {
    name: "Substitui 0 por 1",
    data: ['1', '1', '0', '1', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: '1', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'qf', write: '1', move: 'P' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  }
};

const convertTmArrayToObject = (rulesArray) => {
  const obj = {};
  rulesArray.forEach(r => {
    if (!r.currentState || !r.readSymbol) return;
    const key = `${r.currentState}_${r.readSymbol}`;
    obj[key] = {
      nextState: r.nextState,
      write: r.writeSymbol,
      move: r.move === 'D' ? 1 : r.move === 'E' ? -1 : 0,
      rule: `Π(${r.currentState}, ${r.readSymbol}) = (${r.nextState}, ${r.writeSymbol}, ${r.move})`
    };
  });
  return obj;
};

export default function TheoryOfComputationHub() {
  const [activeTab, setActiveTab] = useLocalStorage('toc-active-tab', 'turing');
  const [showConfig, setShowConfig] = useState(false);

  // Estados Ativos (Agora salvos no Local Storage)
  const [tmRules, setTmRules] = useLocalStorage('toc-tm-rules', TM_EXAMPLES.parity.rules);
  const [tmInput, setTmInput] = useLocalStorage('toc-tm-input', TM_EXAMPLES.parity.input);
  const [tmAccept, setTmAccept] = useLocalStorage('toc-tm-accept', TM_EXAMPLES.parity.accept);
  
  const [utmRules, setUtmRules] = useLocalStorage('toc-utm-rules', UTM_EXAMPLES.inverter.rules);
  const [utmInitialData, setUtmInitialData] = useLocalStorage('toc-utm-data', UTM_EXAMPLES.inverter.data);
  const [cantorSize, setCantorSize] = useLocalStorage('toc-cantor-size', 8);

  // Estados de Edição Temporária no Painel
  const [editingTmRules, setEditingTmRules] = useState([]);
  const [editingTmInput, setEditingTmInput] = useState('');
  const [editingTmAccept, setEditingTmAccept] = useState('');
  
  const [editingUtmRules, setEditingUtmRules] = useState([]);
  const [editingUtmData, setEditingUtmData] = useState('');
  const [editingCantorSize, setEditingCantorSize] = useState(8);
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
      setError('');
    }
  }, [showConfig, tmRules, tmInput, tmAccept, utmRules, utmInitialData, cantorSize]);

  const handleApplyConfig = () => {
    try {
      if (editingTmRules.length === 0) throw new Error("TM: Adicione pelo menos uma regra.");
      const parsedUtmData = editingUtmData.split(',').map(s => s.trim()).filter(s => s !== '');
      if (parsedUtmData.length === 0) throw new Error("MTU: A fita não pode estar vazia.");
      if (editingUtmRules.length === 0) throw new Error("MTU: Adicione pelo menos uma regra.");
      
      const size = parseInt(editingCantorSize);
      if (isNaN(size) || size < 2 || size > 20) throw new Error("Cantor: Tamanho deve ser entre 2 e 20.");

      setTmRules(editingTmRules);
      setTmInput(editingTmInput);
      setTmAccept(editingTmAccept);
      
      setUtmRules(editingUtmRules);
      setUtmInitialData(parsedUtmData);
      setCantorSize(size);
      
      setError('');
      setShowConfig(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Carrega Padrão e APLICA automaticamente salvando no Local Storage
  const loadTmExample = (key) => {
    const ex = TM_EXAMPLES[key];
    const rulesCopy = JSON.parse(JSON.stringify(ex.rules));
    setEditingTmRules(rulesCopy);
    setEditingTmInput(ex.input);
    setEditingTmAccept(ex.accept);
    
    setTmRules(rulesCopy);
    setTmInput(ex.input);
    setTmAccept(ex.accept);
    setError('');
  };

  const loadUtmExample = (key) => {
    const ex = UTM_EXAMPLES[key];
    const rulesCopy = JSON.parse(JSON.stringify(ex.rules));
    setEditingUtmRules(rulesCopy);
    setEditingUtmData(ex.data.join(', '));
    
    setUtmRules(rulesCopy);
    setUtmInitialData(ex.data);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <nav className="bg-[#0f172a] border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Cpu className="text-blue-500" />
            <span>ToC Visualizer</span>
          </div>
          
          <div className="flex gap-2 bg-[#020617] p-1 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
            <NavButton active={activeTab === 'turing'} onClick={() => { setActiveTab('turing'); setShowConfig(false); }} icon={<Type size={16} />} label="Máquina de Turing" />
            <NavButton active={activeTab === 'utm'} onClick={() => { setActiveTab('utm'); setShowConfig(false); }} icon={<Cpu size={16} />} label="MTU" />
            <NavButton active={activeTab === 'cantor'} onClick={() => { setActiveTab('cantor'); setShowConfig(false); }} icon={<Grid size={16} />} label="Diagonalização" />
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
                Configurando: {activeTab === 'turing' ? 'Máquina de Turing' : activeTab === 'utm' ? 'Máquina Universal' : 'Diagonalização'}
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
                {activeTab === 'cantor' && [4, 8, 16].map(size => (
                  <button key={size} onClick={() => { setEditingCantorSize(size); setCantorSize(size); }} className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-green-600 hover:text-white text-slate-300 rounded border border-slate-700 hover:border-green-500 transition-colors">
                    Matriz {size}x{size}
                  </button>
                ))}
              </div>
            </div>

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
                          <td className="py-2 pr-2"><input type="text" value={rule.write} onChange={(e) => {const n=[...editingUtmRules]; n[idx].write=e.target.value; setEditingUtmRules(n);}} className="w-16 bg-[#0f172a] border border-slate-700 rounded p-1.5 text-purple-400 font-bold text-center outline-none" /></td>
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
        {activeTab === 'cantor' && <CantorDiagonalization matrixSize={cantorSize} />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon} {label}
    </button>
  );
}