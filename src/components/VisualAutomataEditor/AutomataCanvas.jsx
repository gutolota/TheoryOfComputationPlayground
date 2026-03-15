import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { Plus, Trash2, Flag, CheckCircle2, RotateCcw } from 'lucide-react';

const nodeTypes = { stateNode: StateNode };
const edgeTypes = { transitionEdge: TransitionEdge };

const initialNodes = [
  { 
    id: 'q0', 
    type: 'stateNode', 
    position: { x: 100, y: 150 }, 
    data: { label: 'q0', isInitial: true, isAccept: false } 
  },
];

export default function AutomataCanvas({ onSync }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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
        data: { label: '0', onLabelChange: onEdgeLabelChange },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges, onEdgeLabelChange]
  );

  const addNewState = useCallback(() => {
    const id = `q${nodes.length}`;
    const newNode = {
      id,
      type: 'stateNode',
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label: id, isInitial: false, isAccept: false },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const toggleInitial = useCallback(() => {
    const selected = nodes.find(n => n.selected);
    if (!selected) return;
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isInitial: n.id === selected.id ? !n.data.isInitial : false }
    })));
  }, [nodes, setNodes]);

  const toggleAccept = useCallback(() => {
    const selected = nodes.find(n => n.selected);
    if (!selected) return;
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, isAccept: n.id === selected.id ? !n.data.isAccept : n.data.isAccept }
    })));
  }, [nodes, setNodes]);

  const deleteSelected = useCallback(() => {
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
  }, [setNodes, setEdges]);

  // Sincroniza com o simulador principal
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

  return (
    <div className="w-full h-[600px] bg-[#020617] rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" gap={20} />
        <Controls />
        
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

        <Panel position="bottom-right" className="bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700 p-3 rounded-lg text-[10px] text-slate-500 max-w-[200px]">
          <p className="font-bold mb-1 uppercase text-slate-400">Instruções:</p>
          <ul className="list-disc ml-3 space-y-1">
            <li>Arraste entre estados para criar conexões.</li>
            <li>Selecione um estado para marcá-lo como inicial ou final.</li>
            <li>Use vírgulas para múltiplos símbolos (ex: 0,1).</li>
          </ul>
        </Panel>
      </ReactFlow>
    </div>
  );
}
