'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGuides, isMockModeEnabled } from '@/lib/api';
import { Guide } from '@/lib/types';
import { GuideCard } from '@/components/GuideCard';
import { GuideFilters } from '@/components/GuideFilters';
import { useState } from 'react';

export default function HomePage() {
  const { data, isLoading, isError } = useQuery<Guide[]>({
    queryKey: ['guides'],
    queryFn: () => fetchGuides(),
  });

  const [search, setSearch] = useState('');

  const filtered = (data ?? []).filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <main className="page-shell">
        <div className="state-card state-card--loading">
          Chargement des guides...
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <div className="state-card state-card--error">
        <p className="mb-2 text-red-700">
          Une erreur est survenue lors du chargement des guides.
        </p>
        <button
          className="primary-button"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <main className="page-shell">
      <div className="home-bg-layer">
        <div className="home-orb-left" />
        <div className="home-orb-right" />
      </div>

      <section className="hero-panel animate-fade-in-down">
        <h1 className="hero-title">
          Mes guides
        </h1>
        <p className="hero-subtitle">
          Retrouvez vos itineraires sous forme de cartes claires et visuelles.
        </p>
      </section>

      <div className="animate-fade-in-up delay-100">
        <GuideFilters onSearchChange={setSearch} />
      </div>

      {isMockModeEnabled() && (
        <p className="mock-banner animate-fade-in-up">
          Mode demo actif: donnees mock chargees localement.
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="state-card state-card--empty animate-fade-in-up">
          Aucun guide ne correspond a votre recherche.
        </p>
      ) : (
        <section className="guides-grid">
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