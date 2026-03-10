import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, StepForward, RotateCcw, Cpu, Monitor, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';

export default function UniversalTuringMachine({ programRules, initialData }) {
  const [isCompiled, setIsCompiled] = useState(false);
  
  const [logicalTape, setLogicalTape] = useState([...initialData]);
  const [logicalHead, setLogicalHead] = useState(0);
  const [logicalState, setLogicalState] = useState('q0');
  
  const [utmPhase, setUtmPhase] = useState('IDLE');
  const [utmHeadPos, setUtmHeadPos] = useState(0);
  const [activeRuleIndex, setActiveRuleIndex] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const tapeRef = useRef(null);

  useEffect(() => {
    setIsCompiled(false);
    resetSimulation();
  }, [programRules, initialData]);

  const codeTape = programRules.flatMap(r => [r.fromS, r.read, r.toS, r.write, r.move]);
  const separatorPos = codeTape.length;
  const dataOffset = separatorPos + 1;
  
  const universalTape = [
    ...codeTape.map((val, i) => ({ type: 'code', val, index: i, ruleIdx: Math.floor(i / 5) })),
    { type: 'sep', val: '$', index: separatorPos },
    ...logicalTape.map((val, i) => ({ type: 'data', val, index: dataOffset + i }))
  ];

  const resetSimulation = useCallback(() => {
    setLogicalTape([...initialData]);
    setLogicalHead(0);
    setLogicalState('q0');
    setUtmPhase('IDLE');
    setUtmHeadPos(dataOffset);
    setActiveRuleIndex(null);
    setIsRunning(false);
  }, [dataOffset, initialData]);

  const compileToTape = () => {
    setIsCompiled(true);
    setUtmHeadPos(dataOffset);
  };

  const performStep = useCallback(() => {
    if (utmPhase === 'HALT') {
      setIsRunning(false);
      return;
    }

    if (utmPhase === 'IDLE' || utmPhase === 'EXECUTE') {
      setUtmPhase('FETCH');
      setUtmHeadPos(dataOffset + logicalHead);
      setActiveRuleIndex(null);
    } else if (utmPhase === 'FETCH') {
      const currentSymbol = logicalTape[logicalHead];
      const ruleIdx = programRules.findIndex(r => r.fromS === logicalState && r.read === currentSymbol);
      
      if (ruleIdx === -1) {
        setUtmPhase('HALT');
        setIsRunning(false);
        return;
      }
      
      setActiveRuleIndex(ruleIdx);
      setUtmPhase('DECODE');
      setUtmHeadPos(ruleIdx * 5 + 1);
      
    } else if (utmPhase === 'DECODE') {
      const rule = programRules[activeRuleIndex];
      setUtmPhase('EXECUTE');
      setUtmHeadPos(dataOffset + logicalHead);
      
      setLogicalTape(prev => {
        const newTape = [...prev];
        newTape[logicalHead] = rule.write;
        if (logicalHead >= newTape.length - 1 && rule.move === 'D') {
          newTape.push('β', 'β');
        }
        return newTape;
      });
      
      setLogicalState(rule.toS);
      setLogicalHead(prev => prev + (rule.move === 'D' ? 1 : -1));
      
      if (rule.toS === 'qf') {
        setTimeout(() => setUtmPhase('HALT'), 500);
      }
    }
  }, [utmPhase, logicalHead, dataOffset, logicalTape, logicalState, activeRuleIndex, programRules]);

  useEffect(() => {
    let timer;
    if (isRunning && utmPhase !== 'HALT') {
      const delay = utmPhase === 'DECODE' ? 800 : 500; 
      timer = setTimeout(() => { performStep(); }, delay);
    }
    return () => clearTimeout(timer);
  }, [isRunning, utmPhase, performStep]);

  useEffect(() => {
    if (tapeRef.current && isCompiled) {
      const cellWidth = 48;
      const containerWidth = tapeRef.current.clientWidth;
      const scrollPos = (utmHeadPos * cellWidth) - (containerWidth / 2);
      tapeRef.current.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' });
    }
  }, [utmHeadPos, isCompiled]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex justify-center items-center gap-3">
          <Cpu className="text-blue-500" size={36} /> Máquina de Turing Universal
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base">
          Programas são apenas dados. Veja como a Máquina Universal (MTU) armazena a regra de um programa em sua própria fita e "viaja" para consultá-la durante a execução.
        </p>
      </div>

      {!isCompiled ? (
        <div className="bg-[#0f172a] rounded-xl p-8 border border-slate-800 shadow-2xl max-w-3xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold text-lg">
            <Settings size={22} />
            <h3>1. O Programa Específico (Máquina M)</h3>
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            Este é o comportamento lógico que queremos executar. Ele inverte os bits da entrada.
          </p>
          
          <div className="bg-[#020617] rounded-lg p-1 border border-slate-800/80 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 border-b border-slate-800/80 sticky top-0 bg-[#020617]">
                <tr>
                  <th className="py-4 px-4 font-medium">Estado</th>
                  <th className="py-4 px-4 font-medium">Lê</th>
                  <th className="py-4 px-4 font-medium text-slate-400">→</th>
                  <th className="py-4 px-4 font-medium">Novo Estado</th>
                  <th className="py-4 px-4 font-medium">Escreve</th>
                  <th className="py-4 px-4 font-medium">Move</th>
                </tr>
              </thead>
              <tbody className="font-mono text-slate-300">
                {programRules.map((r, i) => (
                  <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-4">{r.fromS}</td>
                    <td className="py-3 px-4 text-blue-400">{r.read}</td>
                    <td className="py-3 px-4 text-slate-600">→</td>
                    <td className="py-3 px-4">{r.toS}</td>
                    <td className="py-3 px-4 text-purple-400">{r.write}</td>
                    <td className="py-3 px-4">{r.move}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={compileToTape} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Cpu size={20} /> Compilar para Fita Universal <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsRunning(!isRunning)} disabled={utmPhase === 'HALT'} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors font-medium shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                {isRunning ? <Pause size={18} /> : <Play size={18} />} {isRunning ? 'Pausar MTU' : 'Iniciar MTU'}
              </button>
              <button onClick={performStep} disabled={isRunning || utmPhase === 'HALT'} className="flex items-center gap-2 px-5 py-3 bg-[#1e293b] hover:bg-slate-700 disabled:opacity-50 border border-slate-700 rounded-lg transition-colors font-medium text-slate-200">
                <StepForward size={18} /> Avançar Ciclo
              </button>
              <button onClick={resetSimulation} className="flex items-center gap-2 px-5 py-3 bg-[#020617] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors font-medium text-slate-400 hover:text-white">
                <RotateCcw size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-[#020617] rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-500 uppercase">Ciclo MTU:</span>
              <span className={`text-sm font-bold tracking-wider ${utmPhase === 'FETCH' ? 'text-blue-400' : utmPhase === 'DECODE' ? 'text-purple-400' : utmPhase === 'EXECUTE' ? 'text-orange-400' : utmPhase === 'HALT' ? 'text-green-400' : 'text-slate-400'}`}>
                {utmPhase}
              </span>
              {utmPhase === 'HALT' && <CheckCircle2 size={16} className="text-green-500" />}
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
            <div className="flex items-center gap-2 mb-6">
              <Monitor size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Visão Lógica (A Máquina Simulada)</h3>
            </div>
            
            <div className="flex items-center gap-6 overflow-x-auto pb-4 custom-scrollbar">
              <div className="bg-[#020617] border border-slate-800 p-4 rounded-lg flex flex-col items-center flex-shrink-0 min-w-[100px]">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-2">Estado Lógico</span>
                <span className="font-mono text-2xl text-white">{logicalState}</span>
              </div>
              
              <div className="flex gap-2">
                {logicalTape.map((symbol, idx) => {
                  const isHead = idx === logicalHead;
                  return (
                    <div key={`logical-${idx}`} className="flex flex-col items-center gap-2">
                      <div className={`w-14 h-14 flex items-center justify-center font-mono text-2xl rounded-md border-2 transition-colors ${isHead ? 'bg-blue-900/40 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-[#020617] border-slate-800 text-slate-500'}`}>
                        {symbol}
                      </div>
                      {isHead && <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-blue-500 animate-pulse"></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 relative shadow-lg">
            <div className="absolute top-0 left-0 w-1 bg-purple-500 h-full"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-purple-400" />
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Visão Física (Fita da Máquina Universal)</h3>
              </div>
              <div className="hidden sm:flex gap-4 text-[10px] uppercase font-bold tracking-wider">
                <span className="text-purple-400 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-900 border border-purple-500"></span> Código (Regras)</span>
                <span className="text-slate-500 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600"></span> Separador</span>
                <span className="text-blue-400 flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-900 border border-blue-500"></span> Dados</span>
              </div>
            </div>

            <div ref={tapeRef} className="relative bg-[#020617] rounded-lg border border-slate-800 p-8 overflow-x-hidden min-h-[160px]">
              <div className="absolute top-2 transition-all duration-700 ease-in-out z-20 flex flex-col items-center" style={{ left: `${32 + (utmHeadPos * 48)}px`, width: '40px' }}>
                <div className="bg-orange-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.8)]">MTU</div>
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-orange-500 mt-1"></div>
              </div>

              <div className="flex gap-2 mt-2">
                {universalTape.map((cell, idx) => {
                  const isCode = cell.type === 'code';
                  const isSep = cell.type === 'sep';
                  const isData = cell.type === 'data';
                  const isRuleActive = isCode && activeRuleIndex !== null && cell.ruleIdx === activeRuleIndex;
                  const isDataActive = isData && (idx - dataOffset) === logicalHead;
                  const isHeadHere = utmHeadPos === idx;

                  let baseClasses = "flex-shrink-0 w-10 h-14 flex items-center justify-center font-mono text-lg rounded border transition-colors duration-300 ";
                  
                  if (isCode) baseClasses += isRuleActive ? 'bg-purple-900 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-purple-950/20 border-purple-900/30 text-purple-500/50';
                  else if (isSep) baseClasses += 'bg-slate-800 border-slate-600 text-slate-400';
                  else if (isData) baseClasses += isDataActive ? 'bg-blue-900 border-blue-400 text-blue-100' : 'bg-blue-950/20 border-blue-900/30 text-blue-500/50';

                  if (isHeadHere) baseClasses += ' ring-2 ring-orange-500 ring-offset-2 ring-offset-[#020617] bg-opacity-100 brightness-150 scale-105 z-10';

                  return <div key={`utm-${idx}`} className={baseClasses}>{cell.val}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}