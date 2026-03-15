import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Sparkles, Binary, Info } from 'lucide-react';

export default function CantorDiagonalization({ matrixSize = 8 }) {
  const [matrix, setMatrix] = useState([]);
  const [diagonal, setDiagonal] = useState([]);
  const [invertedDiagonal, setInvertedDiagonal] = useState([]);

  useEffect(() => {
    const newMatrix = Array.from({ length: matrixSize }, () =>
      Array.from({ length: matrixSize }, () => Math.round(Math.random()))
    );
    setMatrix(newMatrix);

    const diag = newMatrix.map((row, i) => row[i]);
    setDiagonal(diag);
    setInvertedDiagonal(diag.map(val => (val === 0 ? 1 : 0)));
  }, [matrixSize]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 pb-12">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <Sparkles className="text-purple-600" size={32} />
          Diagonalização de Cantor
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base">
          Demonstração visual de como criar um novo elemento que não existe em uma lista infinita.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Binary size={14} /> Matriz de Sequências
          </h3>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-hidden relative">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))` }}>
              {matrix.map((row, i) =>
                row.map((val, j) => {
                  const isDiagonal = i === j;
                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`
                        aspect-square flex items-center justify-center rounded text-lg font-mono font-bold transition-all duration-700
                        ${isDiagonal 
                          ? 'bg-purple-600 text-white scale-110 z-10 shadow-md rotate-[360deg]' 
                          : 'bg-slate-50 text-slate-300 border border-slate-100 hover:bg-slate-100'}
                      `}
                    >
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagonal Extraída</h3>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {diagonal.map((val, i) => (
                  <div key={i} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-400">
                    {val}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center py-2 text-purple-400">
              <ArrowDownRight size={32} strokeWidth={3} className="animate-bounce" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Nova Sequência (Invertida)</h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Diferente de todas</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2">
                {invertedDiagonal.map((val, i) => (
                  <div key={i} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple-600 text-white rounded font-mono font-bold shadow-md animate-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    {val}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 flex gap-4">
            <div className="mt-1">
              <Info className="text-purple-500" size={20} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">O que isso prova?</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ao inverter cada bit da diagonal (<i>NOT</i>), garantimos que a nova sequência difere da 1ª sequência no 1º bit, da 2ª no 2º bit, e assim por diante. Isso prova que o conjunto de sequências infinitas é incontável.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
