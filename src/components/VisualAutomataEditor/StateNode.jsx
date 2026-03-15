import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export default memo(({ data, selected }) => {
  // O estado 'active' será passado via data pelo React Flow durante a animação
  const isActive = data.active;
  const isAccept = data.isAccept;

  return (
    <div className={`
      relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300
      ${isActive ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-110 z-50 bg-yellow-400/10' : 
        selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 'border-slate-600 bg-[#0f172a] hover:border-slate-500'}
      ${data.isInitial ? 'before:content-["→"] before:absolute before:-left-6 before:text-blue-500 before:text-xl before:font-bold' : ''}
    `}>
      <Handle type="target" position={Position.Top} id="t-top" className="w-3 h-3 !bg-blue-500/50 border-none hover:!bg-blue-400" />
      <Handle type="target" position={Position.Left} id="t-left" className="w-3 h-3 !bg-blue-500/50 border-none hover:!bg-blue-400" />
      <Handle type="target" position={Position.Right} id="t-right" className="w-3 h-3 !bg-blue-500/50 border-none hover:!bg-blue-400" />
      <Handle type="target" position={Position.Bottom} id="t-bottom" className="w-3 h-3 !bg-blue-500/50 border-none hover:!bg-blue-400" />
      
      <div className={`
        w-[85%] h-[85%] rounded-full flex items-center justify-center font-mono font-bold text-white transition-all
        ${isAccept ? 'border-2 border-green-500/50 bg-green-500/10' : ''}
        ${isActive ? 'text-yellow-400' : ''}
      `}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Top} id="s-top" className="w-3 h-3 !bg-blue-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Left} id="s-left" className="w-3 h-3 !bg-blue-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Right} id="s-right" className="w-3 h-3 !bg-blue-500 border-none opacity-0 hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} id="s-bottom" className="w-3 h-3 !bg-blue-500 border-none opacity-0 hover:opacity-100" />
    </div>
  );
});
