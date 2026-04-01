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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-300" />

      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            Guide #{guide.id}
          </span>
          {guide.isShared ? (
            <span className="text-xs font-medium text-slate-600">Partage</span>
          ) : (
            <span className="text-xs font-medium text-slate-600">Prive</span>
          )}
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {guide.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {guide.description || 'Aucune description pour ce guide pour le moment.'}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-600">Jours</dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">
              {guide.days.length}
            </dd>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-600">Activites</dt>
            <dd className="mt-1 text-lg font-bold text-slate-900">
              {totalActivities}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {firstDate
              ? `Debut: ${new Date(firstDate).toLocaleDateString('fr-FR')}`
              : 'Date non definie'}
          </span>
          <span>{guide.ownerName || 'Auteur inconnu'}</span>
        </div>

        <Link
          href={`/guides/${guide.id}`}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-sky-700 hover:to-cyan-600"
        >
          Ouvrir le guide
        </Link>
      </div>
    </article>

  );
}