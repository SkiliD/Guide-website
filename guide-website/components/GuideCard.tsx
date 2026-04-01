// src/components/GuideCard.tsx
import Link from 'next/link';
import { Guide } from '@/lib/types';

type Props = { guide: Guide };

export function GuideCard({ guide }: Props) {
  const totalActivities = guide.days.reduce(
    (count, day) => count + day.activities.length,
    0
  );
  const firstDate = guide.days[0]?.date;

  return (
    <article className="guide-card">
      <div className="guide-card-top-line" />

      <div className="guide-card-body">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="guide-card-pill guide-card-pill--id">
            Guide #{guide.id}
          </span>
          {guide.isShared ? (
            <span className="guide-card-pill guide-card-pill--shared">Partage</span>
          ) : (
            <span className="guide-card-pill guide-card-pill--private">Prive</span>
          )}
        </div>

        <h2 className="guide-card-title">
          {guide.title}
        </h2>

        <p className="guide-card-desc line-clamp-2">
          {guide.description || 'Aucune description pour ce guide pour le moment.'}
        </p>

        <dl className="guide-stats">
          <div className="guide-stat guide-stat--days">
            <dt className="guide-stat-label">Jours</dt>
            <dd className="guide-stat-value">
              {guide.days.length}
            </dd>
          </div>

          <div className="guide-stat guide-stat--activities">
            <dt className="guide-stat-label">Activites</dt>
            <dd className="guide-stat-value">
              {totalActivities}
            </dd>
          </div>
        </dl>

        <div className="guide-meta">
          <span>
            {firstDate
              ? `Debut: ${new Date(firstDate).toLocaleDateString('fr-FR')}`
              : 'Date non definie'}
          </span>
          <span>{guide.ownerName || 'Auteur inconnu'}</span>
        </div>

        <Link
          href={`/guides/${guide.id}`}
          className="guide-open-link"
        >
          Ouvrir le guide
        </Link>
      </div>
    </article>

  );
}