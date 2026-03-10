import React from "react";
export default function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon} {label}
    </button>
  );
}