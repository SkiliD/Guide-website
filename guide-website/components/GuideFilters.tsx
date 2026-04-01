// src/components/GuideFilters.tsx
'use client';

import { useState } from 'react';

type Props = {
  onSearchChange: (value: string) => void;
};

export function GuideFilters({ onSearchChange }: Props) {
  const [value, setValue] = useState('');

  return (
    <div className="guide-filters">
      <input
        className="guide-filters-input"
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