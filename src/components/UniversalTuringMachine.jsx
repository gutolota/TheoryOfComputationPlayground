import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertCircle, CheckCircle2, ChevronRight, Hash, Terminal } from 'lucide-react';

export default function UniversalTuringMachine({ programRules, initialData }) {
  const [tape, setTape] = useState([]);
  const [headPos, setHeadPos] = useState(0);
  const [currentState, setCurrentState] = useState('q0');
  const [status, setStatus] = useState('Idle');
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [lastRule, setLastRule] = useState(null);
  
  const tapeRef = useRef(null);

  const initMachine = useCallback(() => {
    setTape([...initialData]);
    setHeadPos(0);
    setCurrentState('q0');
    setStatus('Idle');
    setIsRunning(false);
    setStepCount(0);
    setLastRule(null);
  }, [initialData]);

  useEffect(() => {
    initMachine();
  }, [initialData, initMachine]);

  useEffect(() => {
    if (tapeRef.current) {
      const cellWidth = 60;
      const containerWidth = tapeRef.current.clientWidth;
      const scrollPos = (headPos * cellWidth) - (containerWidth / 2) + (cellWidth / 2);
      tapeRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  }, [headPos]);

  const step = useCallback(() => {
    if (status === 'Accepted' || status === 'Rejected') {
      setIsRunning(false);
      return;
    }

    const currentSymbol = tape[headPos] || 'β';
    const rule = programRules.find(r => r.fromS === currentState && r.read === currentSymbol);

    if (!rule) {
      setStatus('Rejected');
      setIsRunning(false);
      return;
    }

    setTape(prevTape => {
      const newTape = [...prevTape];
      newTape[headPos] = rule.write;
      // Expande a fita se necessário
      if (headPos === newTape.length - 1 && rule.move === 'D') {
        newTape.push('β', 'β', 'β');
      }
      return newTape;
    });

    const moveVal = rule.move === 'D' ? 1 : rule.move === 'E' ? -1 : 0;
    setHeadPos(prev => Math.max(0, prev + moveVal));
    setCurrentState(rule.toS);
    setStepCount(prev => prev + 1);
    setLastRule(rule);

    if (rule.toS === 'qf' || rule.toS === 'accept' || rule.toS === 'halt') {
      setStatus('Accepted');
      setIsRunning(false);
    }
  }, [currentState, headPos, status, tape, programRules]);

  useEffect(() => {
    let timer;
    if (isRunning && status === 'Running') {
      timer = setTimeout(step, 400);
    }
    return () => clearTimeout(timer);
  }, [isRunning, status, step]);

  const togglePlay = () => {
    if (status === 'Accepted' || status === 'Rejected') {
      initMachine();
      setTimeout(() => { setIsRunning(true); setStatus('Running'); }, 50);
    } else {
      setIsRunning(!isRunning);
      setStatus(isRunning ? 'Idle' : 'Running');
    }
  };

  const handleStep = () => {
    setStatus('Running');
    setIsRunning(false);
    step();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 pb-12">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <ChevronRight className="text-purple-600" size={32} strokeWidth={3} />
          Máquina Universal
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base">
          Execução de programas definidos por regras de transição sobre uma fita de dados genérica.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</span>
            <span className="text-2xl font-mono font-bold text-purple-600">{currentState}</span>
          </div>
          <div className="h-10 w-px bg-slate-100"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passos</span>
            <span className="text-2xl font-mono font-bold text-slate-700">{stepCount}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-8 py-3 rounded transition-all font-bold text-sm shadow-sm ${
              isRunning 
              ? 'bg-slate-100 text-slate-700 border border-slate-300' 
              : 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-700'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Interromper' : 'Executar Programa'}
          </button>
          <button
            onClick={handleStep}
            disabled={isRunning || status === 'Accepted' || status === 'Rejected'}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-bold text-sm text-slate-700 disabled:opacity-50 shadow-sm"
          >
            <StepForward size={18} /> Passo
          </button>
          <button
            onClick={initMachine}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-medium text-slate-500 shadow-sm"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Hash size={14} /> Fita de Dados
            </h3>
            {status === 'Accepted' && <span className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-100">Halt / Accept</span>}
            {status === 'Rejected' && <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">Rejected</span>}
          </div>
          
          <div className="bg-slate-50 rounded-lg p-10 border border-slate-200 relative overflow-hidden">
            <div className="absolute left-0 right-0 top-4 flex justify-center pointer-events-none z-10">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-600"></div>
            </div>

            <div ref={tapeRef} className="flex items-center gap-1.5 overflow-x-auto py-4 px-12 no-scrollbar scroll-smooth">
              {tape.map((symbol, index) => {
                const isActive = index === headPos;
                return (
                  <div
                    key={`${index}-${symbol}`}
                    className={`
                      relative flex-shrink-0 w-12 h-16 flex items-center justify-center text-2xl font-mono font-bold rounded border transition-all duration-500
                      ${isActive ? 'bg-white border-purple-500 text-purple-600 scale-110 z-10 shadow-sm' : 'bg-slate-100/50 border-slate-200 text-slate-400'}
                    `}
                  >
                    {symbol}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Terminal size={14} /> Log de Execução
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-[180px] overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
            {lastRule ? (
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-slate-400 mb-2 border-b border-slate-50 pb-1">Última transição aplicada:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-slate-500">De:</span> <span className="text-purple-600 font-bold">{lastRule.fromS}</span>
                  <span className="text-slate-500">Leu:</span> <span className="text-purple-600 font-bold">{lastRule.read}</span>
                  <span className="text-slate-500">Para:</span> <span className="text-purple-600 font-bold">{lastRule.toS}</span>
                  <span className="text-slate-500">Escreveu:</span> <span className="text-purple-600 font-bold">{lastRule.write}</span>
                  <span className="text-slate-500">Moveu:</span> <span className="text-purple-600 font-bold">{lastRule.move === 'D' ? 'Direita' : 'Esquerda'}</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 italic text-center pt-12 uppercase tracking-widest text-[10px]">Aguardando início...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
