import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, StepForward, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function TuringMachineSimulator({ transitions, acceptState = 'q3', initialState = 'q0', initialInput = '1111', onInputChange }) {
  const [inputString, setInputString] = useState(initialInput);
  const [tape, setTape] = useState([]);
  const [headPos, setHeadPos] = useState(0);
  const [currentState, setCurrentState] = useState(initialState);
  const [status, setStatus] = useState('Idle');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRule, setLastRule] = useState('-');
  
  const tapeRef = useRef(null);

  const initMachine = useCallback((input) => {
    const sanitizedInput = input.trim(); 
    const newTape = ['©', ...sanitizedInput.split(''), 'β', 'β', 'β', 'β', 'β'];
    setTape(newTape);
    setHeadPos(0);
    setCurrentState(initialState);
    setStatus('Idle');
    setIsRunning(false);
    setLastRule('-');
  }, [initialState]);

  // Se a prop inicial muda (quando clica num exemplo), atualiza o campo de texto local
  useEffect(() => {
    setInputString(initialInput);
    initMachine(initialInput);
  }, [initialInput, initMachine]);

  useEffect(() => {
    if (tapeRef.current) {
      const cellWidth = 64;
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
    const transitionKey = `${currentState}_${currentSymbol}`;
    const transition = transitions[transitionKey];

    if (!transition) {
      setStatus('Rejected');
      setIsRunning(false);
      return;
    }

    setTape(prevTape => {
      const newTape = [...prevTape];
      newTape[headPos] = transition.write;
      if (headPos + transition.move >= newTape.length - 2) {
        newTape.push('β', 'β', 'β');
      }
      return newTape;
    });

    setHeadPos(prev => Math.max(0, prev + transition.move));
    setCurrentState(transition.nextState);
    setLastRule(transition.rule || `(q: ${transition.nextState}, w: ${transition.write}, m: ${transition.move})`);

    if (transition.nextState === acceptState) {
      setStatus('Accepted');
      setIsRunning(false);
    }
  }, [currentState, headPos, status, tape, transitions, acceptState]);

  useEffect(() => {
    let timer;
    if (isRunning) {
        if (status !== 'Accepted' && status !== 'Rejected') {
            timer = setTimeout(() => { step(); }, 500);
        } else {
            setIsRunning(false);
        }
    }
    return () => clearTimeout(timer);
  }, [isRunning, status, step]);

  const handleLoad = () => initMachine(inputString);

  const togglePlay = () => {
    if (status === 'Accepted' || status === 'Rejected') {
      initMachine(inputString);
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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Simulador de Máquina de Turing</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base">
          Processamento passo a passo da cadeia de entrada com base nas regras de transição.
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
                placeholder="Ex: 1111"
                disabled={isRunning}
              />
              <button
                onClick={handleLoad}
                disabled={isRunning}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-medium whitespace-nowrap text-slate-700 text-sm disabled:opacity-50"
              >
                Carregar
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
            <button
              onClick={() => initMachine(inputString)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors font-medium text-slate-500 shadow-sm"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoramento de Estado</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estado Atual</p>
              <p className="text-2xl font-mono text-purple-600 font-bold">{currentState}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-100 overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Última Transição</p>
              <p className="text-sm font-mono text-slate-600 truncate mt-1">{lastRule}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border flex flex-col justify-center items-center text-center transition-all duration-300 shadow-sm ${getStatusColor()}`}>
          {status === 'Idle' && <p className="text-lg font-bold uppercase tracking-widest opacity-60">Aguardando...</p>}
          {status === 'Running' && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
              <p className="text-lg font-bold uppercase tracking-widest">Processando</p>
            </div>
          )}
          {status === 'Accepted' && (
            <>
              <CheckCircle2 size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Aceito</h2>
              <p className="text-xs font-medium opacity-80 mt-1">Parada em estado de aceitação.</p>
            </>
          )}
          {status === 'Rejected' && (
            <>
              <AlertCircle size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Rejeitado</h2>
              <p className="text-xs font-medium opacity-80 mt-1">Cadeia não aceita pela máquina.</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Fita da Máquina</h3>
        <div className="bg-white rounded-lg p-10 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 right-0 top-3 flex justify-center pointer-events-none z-10">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-600"></div>
          </div>

          <div ref={tapeRef} className="flex items-center gap-2 overflow-x-auto py-6 px-4 no-scrollbar scroll-smooth">
            {tape.map((symbol, index) => {
              const isActive = index === headPos;
              return (
                <div
                  key={`${index}-${symbol}`}
                  className={`
                    relative flex-shrink-0 w-16 h-20 flex items-center justify-center text-3xl font-mono font-bold rounded border transition-all duration-500
                    ${isActive ? 'bg-purple-50 border-purple-500 text-purple-700 scale-110 z-10 shadow-sm' : 'bg-white border-slate-100 text-slate-300 opacity-60'}
                  `}
                >
                  {symbol}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-100">
              Cabeçote de Leitura/Escrita
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
