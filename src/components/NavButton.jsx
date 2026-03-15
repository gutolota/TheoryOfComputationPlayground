import React from 'react';

export default function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded transition-all font-medium text-sm whitespace-nowrap
        ${active 
          ? 'bg-slate-100 text-purple-600 border border-slate-200' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
