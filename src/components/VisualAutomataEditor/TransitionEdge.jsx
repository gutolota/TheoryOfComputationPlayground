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
          stroke: selected ? '#facc15' : style.stroke || '#475569' 
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
              w-12 h-7 bg-[#020617] border border-slate-700 rounded text-center text-xs font-mono font-bold transition-all
              ${selected ? 'border-yellow-500 text-yellow-400' : 'text-slate-400'}
              focus:outline-none focus:ring-1 focus:ring-yellow-500
            `}
            placeholder="0,1"
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
