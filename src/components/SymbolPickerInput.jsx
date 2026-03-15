import React, { useState, useRef, useEffect } from 'react';

export default function SymbolPickerInput({ value, onChange, className, placeholder, disabled }) {
  const [showPicker, setShowPicker] = useState(false);
  const containerRef = useRef(null);
  
  const symbols = [
    { label: '©', value: '©', title: 'Marcador Inicial (Copyright)' },
    { label: 'β', value: 'β', title: 'Símbolo Branco (Beta)' },
    { label: 'ε', value: 'ε', title: 'Símbolo Vazio (Épsilon)' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleSelect = (s) => {
    // Se o campo estiver vazio ou tiver apenas 1 char, substitui. Se tiver mais, anexa (útil para NFA)
    if (value.length <= 1) {
      onChange(s);
    } else {
      onChange(value + (value.endsWith(',') ? '' : ',') + s);
    }
    setShowPicker(false);
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => !disabled && setShowPicker(true)}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
      />
      {showPicker && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] p-1 flex gap-1 z-[100] animate-in fade-in zoom-in duration-150">
          {symbols.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => handleSelect(s.value)}
              className="w-9 h-9 flex items-center justify-center hover:bg-blue-600 rounded text-white font-bold transition-colors text-lg"
              title={s.title}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
