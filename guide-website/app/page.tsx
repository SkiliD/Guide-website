'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGuides } from '@/lib/api';
import { Guide } from '@/lib/types';
import { GuideCard } from '@/components/GuideCard';
import { GuideFilters } from '@/components/GuideFilters';
import { useState } from 'react';

export default function HomePage() {
  const { data, isLoading, isError, error } = useQuery<Guide[]>({
    queryKey: ['guides'],
    queryFn: () => fetchGuides(),
  });

  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <p>Chargement des guides...</p>;

  if (isError) {
    return (
      <div className="p-4">
        <p className="text-red-600 mb-2">
          Une erreur est survenue lors du chargement des guides.
        </p>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mes guides</h1>
      <GuideFilters onSearchChange={setSearch} />
      {filtered.length === 0 ? (
        <p>Aucun guide ne correspond à votre recherche.</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </main>
  );
}