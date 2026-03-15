import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import SymbolPickerInput from '../SymbolPickerInput';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {},
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onLabelChange = (newVal) => {
    if (data.onLabelChange) {
      data.onLabelChange(id, newVal);
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
          ...style, 
          strokeWidth: 2, 
          stroke: selected ? '#7c3aed' : style.stroke || '#cbd5e1' 
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <SymbolPickerInput
            value={data.label}
            onChange={onLabelChange}
            className={`
              w-12 h-7 bg-white border border-slate-200 rounded text-center text-xs font-mono font-bold transition-all shadow-sm
              ${selected ? 'border-purple-400 text-purple-600' : 'text-slate-500 hover:border-slate-300'}
              focus:outline-none focus:ring-1 focus:ring-purple-400
            `}
            placeholder="0,1"
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
