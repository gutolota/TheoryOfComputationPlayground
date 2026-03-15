import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export default memo(({ data, selected }) => {
  // O estado 'active' será passado via data pelo React Flow durante a animação
  const isActive = data.active;
  const isAccept = data.isAccept;

  return (
    <div className={`
      relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300
      ${isActive ? 'border-purple-500 bg-purple-50 shadow-[0_0_15px_rgba(124,58,237,0.3)] scale-110 z-50' : 
        selected ? 'border-purple-600 bg-white shadow-sm scale-110' : 'border-slate-300 bg-white hover:border-slate-400'}
      ${data.isInitial ? 'before:content-["→"] before:absolute before:-left-6 before:text-purple-600 before:text-xl before:font-bold' : ''}
    `}>
      <Handle type="target" position={Position.Top} id="t-top" className="w-2 h-2 !bg-slate-300 border-none hover:!bg-purple-400" />
      <Handle type="target" position={Position.Left} id="t-left" className="w-2 h-2 !bg-slate-300 border-none hover:!bg-purple-400" />
      <Handle type="target" position={Position.Right} id="t-right" className="w-2 h-2 !bg-slate-300 border-none hover:!bg-purple-400" />
      <Handle type="target" position={Position.Bottom} id="t-bottom" className="w-2 h-2 !bg-slate-300 border-none hover:!bg-purple-400" />
      
      <div className={`
        w-[85%] h-[85%] rounded-full flex items-center justify-center font-mono font-bold transition-all
        ${isAccept ? 'border-2 border-green-500/30 bg-green-50/50' : ''}
        ${isActive ? 'text-purple-700' : 'text-slate-700'}
      `}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Top} id="s-top" className="w-2 h-2 !bg-purple-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Left} id="s-left" className="w-2 h-2 !bg-purple-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="s-right" className="w-2 h-2 !bg-purple-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="w-2 h-2 !bg-purple-500 border-none opacity-0 hover:opacity-100" />
    </div>
  );
});
