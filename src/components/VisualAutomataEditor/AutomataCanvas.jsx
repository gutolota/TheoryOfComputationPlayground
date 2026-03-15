import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StateNode from './StateNode';
import TransitionEdge from './TransitionEdge';
import { Plus, Trash2, Flag, CheckCircle2, Play, RotateCcw, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { nfaStep, getEpsilonClosure } from '../../utils/automataUtils';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { transitionEdge: TransitionEdge };

const initialNodes = [
  { 
    id: 'q0', 
    type: 'stateNode', 
    position: { x: 100, y: 150 }, 
    data: { label: 'q0', isInitial: true, isAccept: false, active: false } 
  },
];

export default function AutomataCanvas({ onSync }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Estados para Simulação Interativa no Grafo
  const [testString, setTestString] = useState('0101');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentActiveStates, setCurrentActiveStates] = useState(new Set());
  const [animIndex, setAnimIndex] = useState(-1);
  const [animResult, setAnimResult] = useState(null); // 'Accepted', 'Rejected', null
  const animationTimer = useRef(null);

  const onEdgeLabelChange = useCallback((edgeId, newLabel) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, label: newLabel } };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const onConnect = useCallback(
    (params) => {
      const edge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: 'transitionEdge',
        data: { label: '0', onLabelChange: onEdgeLabelChange, active: false },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, onEdgeLabelChange]
  );

  // Sincroniza com o simulador externo
  useEffect(() => {
    const initialState = nodes.find(n => n.data.isInitial)?.id || 'q0';
    const acceptStates = nodes.filter(n => n.data.isAccept).map(n => n.id);
    const transitions = edges.flatMap(e => {
      const symbols = e.data.label.split(',').map(s => s.trim()).filter(s => s !== '');
      return symbols.map(s => ({
        from: e.source,
        symbol: s === 'epsilon' || s === 'ε' || s === 'empty' ? 'ε' : s,
        to: e.target
      }));
    });

    onSync({ initialState, acceptStates, transitions });
  }, [nodes, edges, onSync]);

  // Função para limpar o estado visual da animação
  const clearAnimation = useCallback(() => {
    if (animationTimer.current) clearTimeout(animationTimer.current);
    setIsAnimating(false);
    setAnimIndex(-1);
    setAnimResult(null);
    setCurrentActiveStates(new Set());
    
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, active: false } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#475569' } })));
  }, [setNodes, setEdges]);

  const startAnimation = useCallback(() => {
    clearAnimation();
    
    // Preparar transições no formato do utilitário
    const rawTransitions = edges.flatMap(e => {
      const symbols = e.data.label.split(',').map(s => s.trim()).filter(s => s !== '');
      return symbols.map(s => ({
        from: e.source,
        symbol: s === 'epsilon' || s === 'ε' || s === 'empty' ? 'ε' : s,
        to: e.target
      }));
    });

    const initialNodeId = nodes.find(n => n.data.isInitial)?.id || 'q0';
    const initialStates = getEpsilonClosure(new Set([initialNodeId]), rawTransitions);
    
    setIsAnimating(true);
    setCurrentActiveStates(initialStates);
    setAnimIndex(-1); // Significa "Estado Inicial" antes de ler o primeiro char

    // Primeira fase: Mostrar estado inicial (ε-closure)
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, active: initialStates.has(n.id) }
    })));
  }, [nodes, edges, clearAnimation, setNodes]);

  // Loop da Animação
  useEffect(() => {
    if (!isAnimating) return;

    const nextStep = () => {
      const nextIndex = animIndex + 1;
      
      // Se terminou a string, verifica aceitação
      if (nextIndex >= testString.length) {
        const isAccepted = Array.from(currentActiveStates).some(sId => 
          nodes.find(n => n.id === sId)?.data.isAccept
        );
        setAnimResult(isAccepted ? 'Accepted' : 'Rejected');
        setIsAnimating(false);
        return;
      }

      const symbol = testString[nextIndex];
      const rawTransitions = edges.flatMap(e => {
        const symbols = e.data.label.split(',').map(s => s.trim()).filter(s => s !== '');
        return symbols.map(s => ({ from: e.source, symbol: s, to: e.target, edgeId: e.id }));
      });

      // Calcular próximos estados
      const nextActiveStates = nfaStep(currentActiveStates, symbol, rawTransitions);

      // Identificar arestas que estão sendo percorridas
      const activeEdgeIds = rawTransitions
        .filter(t => currentActiveStates.has(t.from) && t.symbol === symbol)
        .map(t => t.edgeId);

      // Atualizar Visualmente Nodes e Edges
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, active: nextActiveStates.has(n.id) }
      })));

      setEdges(eds => eds.map(e => ({
        ...e,
        animated: activeEdgeIds.includes(e.id),
        style: { 
          ...e.style, 
          stroke: activeEdgeIds.includes(e.id) ? '#facc15' : '#475569',
          strokeWidth: activeEdgeIds.includes(e.id) ? 3 : 2
        }
      })));

      setCurrentActiveStates(nextActiveStates);
      setAnimIndex(nextIndex);

      if (nextActiveStates.size === 0) {
        setAnimResult('Rejected');
        setIsAnimating(false);
      }
    };

    animationTimer.current = setTimeout(nextStep, 1000);
    return () => clearTimeout(animationTimer.current);
  }, [isAnimating, animIndex, testString, currentActiveStates, nodes, edges, setNodes, setEdges]);

  // Funções de manipulação do grafo (mesmas de antes)
  const addNewState = useCallback(() => {
    const id = `q${nodes.length}`;
    setNodes((nds) => nds.concat({
      id,
      type: 'stateNode',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label: id, isInitial: false, isAccept: false, active: false },
    }));
  }, [nodes.length, setNodes]);

  const toggleInitial = useCallback(() => {
    const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedIds.length === 0) return;
    const targetId = selectedIds[0];
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isInitial: n.id === targetId }
    })));
  }, [nodes, setNodes]);

  const toggleAccept = useCallback(() => {
    const selectedIds = nodes.filter(n => n.selected).map(n => n.id);
    if (selectedIds.length === 0) return;
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isAccept: selectedIds.includes(n.id) ? !n.data.isAccept : n.data.isAccept }
    })));
  }, [nodes, setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-[600px] bg-[#020617] rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative group">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode="loose"
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" gap={20} />
        <Controls />
        
        {/* Painel de Ferramentas de Desenho */}
        <Panel position="top-left" className="flex flex-col gap-2">
          <button onClick={addNewState} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all">
            <Plus size={18} /> Novo Estado
          </button>
          <div className="flex gap-2 bg-[#0f172a] p-1 rounded-lg border border-slate-700">
            <button onClick={toggleInitial} className="p-2 text-slate-400 hover:text-blue-400 title='Marcar como Inicial'">
              <Flag size={18} />
            </button>
            <button onClick={toggleAccept} className="p-2 text-slate-400 hover:text-green-400 title='Marcar como Final'">
              <CheckCircle2 size={18} />
            </button>
            <button onClick={deleteSelected} className="p-2 text-slate-400 hover:text-red-400 title='Excluir Selecionado'">
              <Trash2 size={18} />
            </button>
          </div>
        </Panel>

        {/* PAINEL DE TESTE INTERATIVO NO GRAFO */}
        <Panel position="top-right" className="bg-[#0f172a] border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[300px] animate-in slide-in-from-right-4 duration-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Search size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">Simulação Visual</span>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Entrada..."
                disabled={isAnimating}
                className="flex-1 bg-[#020617] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:ring-1 focus:ring-yellow-500 outline-none"
              />
              <button 
                onClick={isAnimating ? clearAnimation : startAnimation}
                className={`p-2 rounded-lg transition-all ${isAnimating ? 'bg-red-900/40 text-red-400 border border-red-500/50' : 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.2)]'}`}
              >
                {isAnimating ? <RotateCcw size={20} /> : <Play size={20} />}
              </button>
            </div>

            {/* Resultado da Simulação */}
            {animResult && (
              <div className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border font-bold animate-in zoom-in duration-300
                ${animResult === 'Accepted' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/30 border-red-500 text-red-400'}
              `}>
                {animResult === 'Accepted' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {animResult === 'Accepted' ? 'Cadeia Aceita!' : 'Cadeia Rejeitada'}
              </div>
            )}

            {/* Visualização do Caractere Atual */}
            {isAnimating && (
              <div className="flex justify-center gap-1 font-mono">
                {testString.split('').map((char, i) => (
                  <span key={i} className={`
                    w-6 h-8 flex items-center justify-center rounded border transition-all
                    ${i === animIndex ? 'bg-yellow-500 text-black border-yellow-400 font-bold scale-110' : 'bg-slate-800 border-slate-700 text-slate-500'}
                  `}>
                    {char}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel position="bottom-right" className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700 p-3 rounded-lg text-[10px] text-slate-500 max-w-[200px]">
          <p className="font-bold mb-1 uppercase text-slate-400">Instruções:</p>
          <ul className="list-disc ml-3 space-y-1">
            <li>Arraste entre estados para criar transições.</li>
            <li>Digite a entrada na busca para animar o caminho.</li>
            <li>Use vírgulas para múltiplos símbolos (ex: 0,1).</li>
          </ul>
        </Panel>
      </ReactFlow>
    </div>
  );
}
