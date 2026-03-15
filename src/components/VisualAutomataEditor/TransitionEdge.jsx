import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

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

  const onLabelChange = (evt) => {
    if (data.onLabelChange) {
      data.onLabelChange(id, evt.target.value);
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
          stroke: selected ? '#3b82f6' : '#475569' 
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
          <input
            value={data.label}
            onChange={onLabelChange}
            className={`
              w-10 h-6 bg-[#020617] border border-slate-700 rounded text-center text-xs font-mono font-bold transition-all
              ${selected ? 'border-blue-500 text-blue-400' : 'text-slate-400'}
              focus:outline-none focus:ring-1 focus:ring-blue-500
            `}
            placeholder="0,1"
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
