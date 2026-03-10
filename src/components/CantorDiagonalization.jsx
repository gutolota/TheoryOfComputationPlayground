import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ArrowDown, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function CantorDiagonalization({ matrixSize = 8 }) {
  const [matrix, setMatrix] = useState([]);
  const [toggledBits, setToggledBits] = useState(Array(matrixSize).fill(false));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const generateMatrix = useCallback(() => {
    const newMatrix = Array.from({ length: matrixSize }, () =>
      Array.from({ length: matrixSize }, () => (Math.random() > 0.5 ? 1 : 0))
    );
    setMatrix(newMatrix);
    setToggledBits(Array(matrixSize).fill(false));
    setHoveredIndex(null);
  }, [matrixSize]);

  useEffect(() => {
    generateMatrix();
  }, [matrixSize, generateMatrix]);

  const handleDiagonalClick = (index) => {
    setToggledBits((prev) => {
      const newToggled = [...prev];
      newToggled[index] = true;
      return newToggled;
    });
  };

  const allToggled = matrix.length > 0 && toggledBits.every(Boolean);

  if (matrix.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 selection:bg-purple-900 selection:text-white pt-4">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          O Argumento da Diagonalização de Cantor
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base leading-relaxed">
          Prova por contradição de que o conjunto das partes de <span className="font-mono text-purple-400">ℕ</span>, denotado por <span className="font-mono text-purple-400">𝒫(ℕ)</span>, é incontável. 
          Suponha, por absurdo, que possamos listar todos os subconjuntos na matriz abaixo.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={generateMatrix}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all border border-slate-700 font-medium shadow-lg hover:shadow-xl"
        >
          <RefreshCw size={18} className={toggledBits.some(Boolean) && !allToggled ? "" : "animate-[spin_3s_linear_infinite]"} />
          Gerar Nova Suposta Lista
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg relative overflow-x-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 min-w-[500px]">
              <h2 className="text-lg font-semibold text-slate-300">Matriz de Subconjuntos (S<sub className="text-xs">k</sub>)</h2>
              <span className="text-xs bg-purple-900/30 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/30 font-medium">
                Clique na diagonal principal
              </span>
            </div>

            <div className="min-w-max pb-4">
              <div className="flex mb-2">
                <div className="w-12 flex-shrink-0"></div>
                {Array.from({ length: matrixSize }).map((_, i) => (
                  <div key={`col-${i}`} className="w-12 text-center text-xs font-mono text-slate-500">
                    e<sub className="text-[10px]">{i}</sub>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {matrix.map((row, rIndex) => {
                  const isDefeated = toggledBits[rIndex];
                  const isHovered = hoveredIndex === rIndex;
                  
                  return (
                    <div 
                      key={`row-${rIndex}`} 
                      className={`flex items-center transition-all duration-300 rounded-lg ${isHovered ? 'bg-slate-800/50 ring-1 ring-slate-700' : ''}`}
                      onMouseEnter={() => setHoveredIndex(rIndex)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="w-12 flex-shrink-0 text-right pr-4 font-mono text-sm text-slate-400 flex items-center justify-end gap-2">
                        {isDefeated && <CheckCircle2 size={12} className="text-green-500" />}
                        <span className={isDefeated ? "text-slate-600 line-through decoration-red-500/50" : ""}>
                          S<sub className="text-[10px]">{rIndex}</sub>
                        </span>
                      </div>
                      
                      {row.map((val, cIndex) => {
                        const isDiagonal = rIndex === cIndex;
                        const isToggled = isDiagonal && toggledBits[rIndex];
                        let cellClass = "w-12 h-10 flex items-center justify-center font-mono text-lg transition-all duration-300 rounded-md ";
                        
                        if (isDiagonal) {
                          if (isToggled) {
                            cellClass += "bg-purple-900/80 border border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10 scale-110";
                          } else {
                            cellClass += "bg-blue-900/40 border border-blue-500 text-blue-300 cursor-pointer hover:bg-blue-800/60 hover:scale-110 z-10 animate-pulse";
                          }
                        } else {
                          if (isDefeated) {
                             cellClass += "text-slate-700 opacity-50";
                          } else if (isHovered && cIndex === rIndex) {
                             cellClass += "text-slate-300 bg-[#020617] border border-slate-700";
                          } else {
                             cellClass += "text-slate-500";
                          }
                        }

                        return (
                          <div 
                            key={`cell-${rIndex}-${cIndex}`}
                            onClick={() => isDiagonal && !isToggled && handleDiagonalClick(rIndex)}
                            className={cellClass}
                            title={isDiagonal ? "Inverter este bit para criar o novo conjunto" : `Elemento ${cIndex} do conjunto S${rIndex}`}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-4 text-slate-600">
            <ArrowDown className="animate-bounce" />
          </div>

          <div className="bg-[#0f172a] rounded-xl p-6 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-x-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 min-w-[500px]">
              <h3 className="text-lg font-semibold text-purple-300">Novo Conjunto (D)</h3>
              <span className="text-xs text-slate-400 font-mono bg-[#020617] px-3 py-1.5 rounded-md border border-slate-800">
                D = {'{'} d<sub className="text-[10px]">0</sub>, d<sub className="text-[10px]">1</sub>, ... {'}'}
              </span>
            </div>
            
            <div className="flex items-center min-w-max pb-2">
              <div className="w-12 flex-shrink-0 text-right pr-4 font-mono text-lg font-bold text-purple-400">
                D
              </div>
              {Array.from({ length: matrixSize }).map((_, i) => {
                const isToggled = toggledBits[i];
                const originalBit = matrix[i][i];
                const newBit = isToggled ? (originalBit === 1 ? 0 : 1) : '?';
                
                return (
                  <div 
                    key={`d-${i}`}
                    onMouseEnter={() => isToggled && setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`w-12 h-14 flex flex-col items-center justify-center font-mono rounded-md mx-0.5 transition-all duration-300 ${isToggled ? 'bg-purple-600 text-white font-bold shadow-md ring-2 ring-purple-400 ring-offset-2 ring-offset-[#0f172a] scale-105 cursor-help' : 'bg-[#020617] border border-slate-800 text-slate-600'}`}
                    title={isToggled ? `Bit original era ${originalBit}. Invertido para ${newBit}. Isso garante que D ≠ S${i}` : "Aguardando inversão..."}
                  >
                    <span className="text-xl">{newBit}</span>
                    {isToggled && <span className="text-[10px] text-purple-200 mt-[-2px] opacity-80">≠S<sub className="text-[8px]">{i}</sub></span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-lg flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Info size={18} className="text-blue-400" /> Verificação Logica
            </h3>
            
            <div className="text-sm text-slate-300 space-y-3 mb-6 bg-[#020617] p-5 rounded-lg border border-slate-800">
              <p>Construímos o conjunto <strong>D</strong> alterando sistematicamente a diagonal da matriz.</p>
              <p>Para cada linha <span className="font-mono text-xs bg-slate-800 px-1 rounded">k</span>, definimos que o elemento <span className="font-mono text-xs bg-slate-800 px-1 rounded">k</span> de <strong>D</strong> é o oposto do elemento <span className="font-mono text-xs bg-slate-800 px-1 rounded">k</span> de <span className="font-mono text-xs bg-slate-800 px-1 rounded">S<sub>k</sub></span>.</p>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: matrixSize }).map((_, i) => {
                const isToggled = toggledBits[i];
                const originalBit = matrix[i][i];
                const newBit = originalBit === 1 ? 0 : 1;
                
                return (
                  <div 
                    key={`tracker-${i}`}
                    onMouseEnter={() => isToggled && setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`p-3 rounded-lg border text-sm transition-all duration-300 flex items-start gap-3 ${isToggled ? 'bg-green-900/20 border-green-500/40 text-slate-200 cursor-pointer hover:bg-green-900/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-[#020617] border-slate-800 text-slate-600'} ${hoveredIndex === i ? 'ring-1 ring-green-500' : ''}`}
                  >
                    <div className="mt-0.5">
                      {isToggled ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-900" />}
                    </div>
                    <div>
                      {isToggled ? (
                        <>
                          <p className="font-medium text-green-400">D ≠ S<sub className="text-[10px]">{i}</sub></p>
                          <p className="text-xs opacity-80 font-mono mt-1">S<sub className="text-[8px]">{i}</sub> tem {originalBit} na pos {i}, mas D tem {newBit}.</p>
                        </>
                      ) : (
                        <p className="mt-0.5">Aguardando elemento {i}...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`mt-6 p-5 rounded-xl border-2 transition-all duration-700 ease-in-out transform ${allToggled ? 'bg-red-900/20 border-red-500 text-red-200 translate-y-0 opacity-100 scale-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#020617] border-slate-800 text-slate-700 translate-y-4 opacity-50 scale-95 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className={allToggled ? "text-red-500 animate-pulse" : ""} />
                <h4 className="font-bold uppercase tracking-wider text-red-400">Contradição!</h4>
              </div>
              <p className="text-sm leading-relaxed">
                O conjunto <strong>D</strong> foi construído de forma que difere de <em>todos</em> os <span className="font-mono text-xs">S<sub>k</sub></span> da nossa suposta lista completa. Logo, a lista está incompleta e <span className="font-mono text-xs">𝒫(ℕ)</span> é incontável!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}