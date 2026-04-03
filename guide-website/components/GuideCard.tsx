// src/components/GuideCard.tsx
import Link from 'next/link';
import { Guide } from '@/lib/types';
import { mobilityLabel, seasonLabel, audienceLabel } from '@/lib/labels';

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
            Guide #{guide.id.slice(0, 6)}
          </span>
          {guide.isShared ? (
            <span className="guide-card-pill guide-card-pill--shared">Partagé</span>
          ) : (
            <span className="guide-card-pill guide-card-pill--private">Privé</span>
          )}
        </div>

        <h2 className="guide-card-title">
          {guide.title}
        </h2>

        <p className="guide-card-desc line-clamp-2">
          {guide.description || 'Aucune description pour ce guide pour le moment.'}
        </p>

        {/* Tags: mobility, season, audience */}
        <div className="guide-tags">
          {(Array.isArray(guide.mobility) ? guide.mobility : []).map(m => (
            <span key={m} className="guide-tag guide-tag--mobility">{mobilityLabel(m)}</span>
          ))}
          {(Array.isArray(guide.season) ? guide.season : []).map(s => (
            <span key={s} className="guide-tag guide-tag--season">{seasonLabel(s)}</span>
          ))}
          {(Array.isArray(guide.audience) ? guide.audience : []).map(a => (
            <span key={a} className="guide-tag guide-tag--audience">{audienceLabel(a)}</span>
          ))}
        </div>

        <dl className="guide-stats">
          <div className="guide-stat guide-stat--days">
            <dt className="guide-stat-label">Jours</dt>
            <dd className="guide-stat-value">
              {guide.daysCount}
            </dd>
          </div>

          <div className="guide-stat guide-stat--activities">
            <dt className="guide-stat-label">Activités</dt>
            <dd className="guide-stat-value">
              {totalActivities}
            </dd>
          </div>
        </dl>

        <div className="guide-meta">
          <span>
            {firstDate
              ? `Début : ${new Date(firstDate).toLocaleDateString('fr-FR')}`
              : 'Date non définie'}
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