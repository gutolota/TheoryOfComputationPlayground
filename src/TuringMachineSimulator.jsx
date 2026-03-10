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
    if (isRunning && status !== 'Accepted' && status !== 'Rejected') {
      timer = setTimeout(() => { step(); }, 500);
    } else {
      setIsRunning(false);
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
      case 'Accepted': return 'text-green-400 bg-green-900/30 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]';
      case 'Rejected': return 'text-red-400 bg-red-900/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]';
      case 'Running': return 'text-blue-400 bg-blue-900/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
      default: return 'text-gray-400 bg-[#020617] border-slate-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Simulador de Máquina de Turing</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Processamento passo a passo da cadeia de entrada com base nas regras ativas do painel de configuração.
        </p>
      </div>

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
                  if (onInputChange) onInputChange(val); // Sincroniza e salva no Local Storage
                }}
                className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg transition-all"
                placeholder="Ex: 1111"
                disabled={isRunning}
              />
              <button
                onClick={handleLoad}
                disabled={isRunning}
                className="px-6 py-3 bg-[#1e293b] hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors font-medium whitespace-nowrap disabled:opacity-50"
              >
                Carregar
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
            <button
              onClick={() => initMachine(inputString)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#020617] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors font-medium"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monitoramento de Estado</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#020617] p-4 rounded-lg border border-slate-800">
              <p className="text-xs text-slate-500 mb-1">Estado Atual</p>
              <p className="text-2xl font-mono text-blue-400 font-bold">{currentState}</p>
            </div>
            <div className="bg-[#020617] p-4 rounded-lg border border-slate-800 overflow-hidden">
              <p className="text-xs text-slate-500 mb-1">Última Transição</p>
              <p className="text-sm font-mono text-purple-400 truncate mt-1">{lastRule}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 border flex flex-col justify-center items-center text-center transition-all duration-300 ${getStatusColor()}`}>
          {status === 'Idle' && <p className="text-lg font-medium">Aguardando início...</p>}
          {status === 'Running' && <p className="text-lg font-medium flex items-center gap-2 animate-pulse"><Play size={20} /> Em processamento...</p>}
          {status === 'Accepted' && (
            <>
              <CheckCircle2 size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Aceito</h2>
              <p className="text-sm opacity-80 mt-1">Estado final de aceitação alcançado.</p>
            </>
          )}
          {status === 'Rejected' && (
            <>
              <AlertCircle size={40} className="mb-2" />
              <h2 className="text-2xl font-bold uppercase tracking-widest">Rejeitado</h2>
              <p className="text-sm opacity-80 mt-1">Transição indefinida ou travamento.</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">Fita da Máquina</h3>
        <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800 shadow-lg relative">
          <div className="absolute left-0 right-0 top-3 flex justify-center pointer-events-none z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-blue-500 shadow-blue-500/50"></div>
          </div>

          <div ref={tapeRef} className="flex items-center gap-2 overflow-x-hidden pt-4 pb-2">
            {tape.map((symbol, index) => {
              const isActive = index === headPos;
              return (
                <div
                  key={`${index}-${symbol}`}
                  className={`
                    relative flex-shrink-0 w-16 h-20 flex items-center justify-center text-3xl font-mono font-bold rounded-md border-2 transition-all duration-300
                    ${isActive ? 'bg-blue-900/40 border-blue-500 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110 z-10' : 'bg-[#020617] border-slate-800 text-slate-500 opacity-80'}
                  `}
                >
                  {symbol}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20">
              Cabeçote de Leitura/Escrita
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}