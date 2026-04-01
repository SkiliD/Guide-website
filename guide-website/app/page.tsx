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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 animate-fade-in-down">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Mes guides
        </h1>
        <p className="mt-2 text-slate-600">
          Retrouvez vos itineraires sous forme de cartes claires et visuelles.
        </p>
      </section>

      <div className="animate-fade-in-up delay-100">
        <GuideFilters onSearchChange={setSearch} />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg px-4 py-6 text-center text-slate-600 animate-fade-in-up">
          Aucun guide ne correspond a votre recherche.
        </p>
      ) : (
        <section className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guide) => (
            <div key={guide.id} className="animate-fade-in-up">
              <GuideCard guide={guide} />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}