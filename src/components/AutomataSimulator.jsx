import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { nfaStep, getEpsilonClosure } from '../utils/automataUtils';

export default function AutomataSimulator({ 
  type = 'DFA', 
  transitions = [], 
  initialState = 'q0', 
  acceptStates = [], 
  initialInput = '',
  onInputChange 
}) {
  const [inputString, setInputString] = useState(initialInput);
  const [currentStates, setCurrentStates] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [status, setStatus] = useState('Idle');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);

  const initSimulator = useCallback((input) => {
    const startStates = getEpsilonClosure(new Set([initialState]), transitions);
    setCurrentStates(startStates);
    setCurrentIndex(-1);
    setStatus('Idle');
    setIsRunning(false);
    setHistory([{ states: Array.from(startStates), symbol: 'START' }]);
  }, [initialState, transitions]);

  useEffect(() => {
    setInputString(initialInput);
    initSimulator(initialInput);
  }, [initialInput, initSimulator]);

  const step = useCallback(() => {
    if (currentIndex >= inputString.length - 1) {
      const isAccepted = Array.from(currentStates).some(s => acceptStates.includes(s));
      setStatus(isAccepted ? 'Accepted' : 'Rejected');
      setIsRunning(false);
      return;
    }

    const nextIndex = currentIndex + 1;
    const symbol = inputString[nextIndex];
    const nextStates = nfaStep(currentStates, symbol, transitions);

    if (nextStates.size === 0) {
      setStatus('Rejected');
      setIsRunning(false);
      setCurrentIndex(nextIndex);
      setCurrentStates(new Set());
      return;
    }

    setCurrentStates(nextStates);
    setCurrentIndex(nextIndex);
    setHistory(prev => [...prev, { states: Array.from(nextStates), symbol }]);

    if (nextIndex === inputString.length - 1) {
      const isAccepted = Array.from(nextStates).some(s => acceptStates.includes(s));
      setStatus(isAccepted ? 'Accepted' : 'Rejected');
      setIsRunning(false);
    }
  }, [currentIndex, currentStates, inputString, transitions, acceptStates]);

  useEffect(() => {
    let timer;
    if (isRunning && status !== 'Accepted' && status !== 'Rejected') {
      timer = setTimeout(step, 800);
    }
    return () => clearTimeout(timer);
  }, [isRunning, status, step]);

  const togglePlay = () => {
    if (status === 'Accepted' || status === 'Rejected') {
      initSimulator(inputString);
      setTimeout(() => setIsRunning(true), 50);
    } else {
      setIsRunning(!isRunning);
      if (status === 'Idle') setStatus('Running');
    }
  };

  const handleStep = () => {
    if (status === 'Idle') setStatus('Running');
    setIsRunning(false);
    step();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Accepted': return 'text-green-400 bg-green-900/30 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]';
      case 'Rejected': return 'text-red-400 bg-red-900/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
      case 'Running': return 'text-blue-400 bg-blue-900/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
      default: return 'text-gray-400 bg-[#020617] border-slate-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Simulador de Autômatos ({type})</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Acompanhe o processamento da cadeia de entrada pelos estados do seu autômato.
        </p>
      </div>

      {/* Controles e Entrada */}
      <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-slate-400">Cadeia de Entrada:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputString(val);
                  if (onInputChange) onInputChange(val);
                }}
                className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg transition-all"
                placeholder="Ex: 0101"
                disabled={isRunning}
              />
              <button
                onClick={() => initSimulator(inputString)}
                disabled={isRunning}
                className="px-6 py-3 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors font-medium whitespace-nowrap disabled:opacity-50"
              >
                Resetar
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={togglePlay}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={handleStep}
              disabled={isRunning || status === 'Accepted' || status === 'Rejected'}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1e293b] hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              <StepForward size={18} /> Passo
            </button>
          </div>
        </div>
      </div>

      {/* Status e Estados Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Estados Ativos</h3>
          <div className="flex flex-wrap gap-2 min-h-[60px] content-start">
            {Array.from(currentStates).map(state => (
              <div 
                key={state}
                className={`px-4 py-2 rounded-lg font-mono font-bold text-lg border-2 transition-all duration-300 ${
                  acceptStates.includes(state) 
                  ? 'bg-green-900/20 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                  : 'bg-blue-900/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                }`}
              >
                {state}
              </div>
            ))}
            {currentStates.size === 0 && <p className="text-slate-600 italic">Nenhum estado ativo (Travado)</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} />
            <span>Estados em <span className="text-green-500 font-bold">verde</span> são estados de aceitação.</span>
          </div>
        </div>

        <div className={`rounded-xl p-6 border flex flex-col justify-center items-center text-center transition-all duration-300 ${getStatusColor()}`}>
          {status === 'Idle' && <p className="text-lg font-medium">Aguardando início...</p>}
          {status === 'Running' && (
            <div className="space-y-2">
              <p className="text-lg font-medium flex items-center gap-2 animate-pulse"><Play size={20} /> Processando...</p>
              <p className="text-sm opacity-70">Lendo: {inputString[currentIndex + 1] || 'Fim'}</p>
            </div>
          )}
          {status === 'Accepted' && (
            <>
              <CheckCircle2 size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Aceito</h2>
              <p className="text-sm opacity-80 mt-1">Cadeia pertence à linguagem do autômato.</p>
            </>
          )}
          {status === 'Rejected' && (
            <>
              <AlertCircle size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Rejeitado</h2>
              <p className="text-sm opacity-80 mt-1">Cadeia não aceita ou autômato travou.</p>
            </>
          )}
        </div>
      </div>

      {/* Visualização da Cadeia */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Cadeia de Processamento</h3>
        <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg overflow-x-auto">
          <div className="flex justify-center gap-1">
            {inputString.split('').map((char, idx) => (
              <div 
                key={idx}
                className={`
                  w-10 h-14 flex items-center justify-center text-2xl font-mono font-bold rounded-md border-2 transition-all duration-300
                  ${idx === currentIndex ? 'bg-blue-600 border-blue-400 text-white scale-110 z-10' : 
                    idx < currentIndex ? 'bg-slate-800 border-slate-700 text-slate-400 opacity-50' : 
                    'bg-[#020617] border-slate-800 text-slate-500'}
                `}
              >
                {char}
              </div>
            ))}
            {inputString.length === 0 && <p className="text-slate-600 font-mono italic">Cadeia Vazia (ε)</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
