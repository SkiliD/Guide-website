// src/components/GuideFilters.tsx
'use client';

import { useState } from 'react';

type Props = {
  onSearchChange: (value: string) => void;
};

export function GuideFilters({ onSearchChange }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="mb-4 flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
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