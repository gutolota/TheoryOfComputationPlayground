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
      case 'Accepted': return 'text-green-700 bg-green-50 border-green-200';
      case 'Rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'Running': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-slate-500 bg-white border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 pb-12">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Simulador de Autômatos ({type})</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base">
          Acompanhe o processamento da cadeia de entrada pelos estados do seu autômato.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cadeia de Entrada</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputString}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputString(val);
                  if (onInputChange) onInputChange(val);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 focus:outline-none focus:border-purple-400 font-mono text-lg transition-all text-slate-800"
                placeholder="Ex: 0101"
                disabled={isRunning}
              />
              <button
                onClick={() => initSimulator(inputString)}
                disabled={isRunning}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-medium whitespace-nowrap text-slate-700 text-sm disabled:opacity-50"
              >
                Resetar
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={togglePlay}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded transition-all font-bold text-sm shadow-sm ${
                isRunning 
                ? 'bg-slate-100 text-slate-700 border border-slate-300' 
                : 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-700'
              }`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={handleStep}
              disabled={isRunning || status === 'Accepted' || status === 'Rejected'}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-bold text-sm text-slate-700 disabled:opacity-50 shadow-sm"
            >
              <StepForward size={18} /> Passo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estados Ativos</h3>
          <div className="flex flex-wrap gap-2 min-h-[60px] content-start">
            {Array.from(currentStates).map(state => (
              <div 
                key={state}
                className={`px-4 py-1.5 rounded font-mono font-bold text-sm border-2 transition-all duration-300 ${
                  acceptStates.includes(state) 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {state}
              </div>
            ))}
            {currentStates.size === 0 && <p className="text-slate-400 italic text-sm">Nenhum estado ativo (Travado)</p>}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Info size={14} />
            <span>Verde indica aceitação.</span>
          </div>
        </div>

        <div className={`rounded-lg p-6 border flex flex-col justify-center items-center text-center transition-all duration-300 shadow-sm ${getStatusColor()}`}>
          {status === 'Idle' && <p className="text-lg font-bold uppercase tracking-widest opacity-60">Aguardando...</p>}
          {status === 'Running' && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
                <p className="text-lg font-bold uppercase tracking-widest">Processando</p>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Lendo: {inputString[currentIndex + 1] || 'Fim'}</p>
            </div>
          )}
          {status === 'Accepted' && (
            <>
              <CheckCircle2 size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Aceito</h2>
              <p className="text-xs font-medium opacity-80 mt-1">Cadeia pertence à linguagem.</p>
            </>
          )}
          {status === 'Rejected' && (
            <>
              <AlertCircle size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Rejeitado</h2>
              <p className="text-xs font-medium opacity-80 mt-1">Cadeia não aceita.</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cadeia de Processamento</h3>
        <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex justify-center gap-1">
            {inputString.split('').map((char, idx) => (
              <div 
                key={idx}
                className={`
                  w-10 h-14 flex items-center justify-center text-2xl font-mono font-bold rounded border transition-all duration-300
                  ${idx === currentIndex ? 'bg-purple-600 border-purple-700 text-white scale-110 z-10 shadow-md' : 
                    idx < currentIndex ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-50' : 
                    'bg-white border-slate-200 text-slate-700'}
                `}
              >
                {char}
              </div>
            ))}
            {inputString.length === 0 && <p className="text-slate-400 font-mono italic">Cadeia Vazia (ε)</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
