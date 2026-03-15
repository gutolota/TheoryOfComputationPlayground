import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export default memo(({ data, selected }) => {
  return (
    <div className={`
      relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300
      ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110' : 'border-slate-600 bg-[#0f172a]'}
      ${data.isInitial ? 'before:content-["→"] before:absolute before:-left-6 before:text-blue-500 before:text-xl before:font-bold' : ''}
    `}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-700" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-700" />
      <Handle type="target" position={Position.Right} className="w-2 h-2 !bg-slate-700" />
      <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-slate-700" />
      
      <div className={`
        w-[90%] h-[90%] rounded-full flex items-center justify-center font-mono font-bold text-white
        ${data.isAccept ? 'border-2 border-green-500/50 bg-green-500/10 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]' : ''}
      `}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Top} className="w-2 h-2 opacity-0" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 opacity-0" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 opacity-0" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
});
