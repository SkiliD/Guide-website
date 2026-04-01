// src/components/GuideFilters.tsx
'use client';

import { useState } from 'react';

type Props = {
  onSearchChange: (value: string) => void;
};

export function GuideFilters({ onSearchChange }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="mb-6 rounded-2xl border border-white/70 bg-white/75 p-3 shadow-[0_10px_30px_rgba(27,42,89,0.08)] backdrop-blur">
      <input
        className="w-full rounded-xl border border-sky-200/70 bg-sky-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        placeholder="Rechercher un guide..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearchChange(e.target.value);
        }}
      />
    </div>
  );
}