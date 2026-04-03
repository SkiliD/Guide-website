'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchGuide } from '@/lib/api';
import { Guide } from '@/lib/types';
import { mobilityLabel, seasonLabel, audienceLabel } from '@/lib/labels';
import { Header } from '@/components/Layout/Header';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const { data, isLoading, isError } = useQuery<Guide>({
    queryKey: ['guide', id],
    queryFn: () => fetchGuide(id),
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <main className="detail-shell flex items-center justify-center">
        <div className="state-card state-card--loading">Chargement...</div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="detail-shell flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600">Chargement du guide...</p>
          </div>
        </main>
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <Header />
        <main className="detail-shell flex items-center justify-center px-4">
          <div className="state-card state-card--error space-y-4 text-center">
            <p className="text-red-600 font-medium">Impossible de charger ce guide</p>
            <button
              onClick={() => router.push("/")}
              className="primary-button"
            >
              Retour
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="detail-shell">
        <div className="detail-bg-layer">
          <div className="detail-orb-left" />
          <div className="detail-orb-right" />
        </div>

        {/* Header */}
        <div className="detail-topbar animate-fade-in-down">
          <div className="detail-topbar-inner flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="back-button group"
            >
              <span className="transform group-hover:-translate-x-0.5 transition-transform">
                &larr;
              </span>
              <span className="hidden sm:inline">Retour</span>
            </button>
            <span className={`visibility-pill ${
              data.isShared ? 'visibility-pill--shared' : 'visibility-pill--private'
            }`}>
              {data.isShared ? 'Partagé' : 'Privé'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="detail-content space-y-10">

          {/* Title and Description */}
          <section className="detail-hero animate-fade-in-up space-y-3">
            <h1 className="detail-title">
              {data.title}
            </h1>
            {data.description && (
              <p className="text-gray-700 text-lg leading-relaxed">{data.description}</p>
            )}
            <div className="guide-tags" style={{ marginTop: '0.75rem' }}>
              {(Array.isArray(data.mobility) ? data.mobility : []).map(m => (
                <span key={m} className="guide-tag guide-tag--mobility">{mobilityLabel(m)}</span>
              ))}
              {(Array.isArray(data.season) ? data.season : []).map(s => (
                <span key={s} className="guide-tag guide-tag--season">{seasonLabel(s)}</span>
              ))}
              {(Array.isArray(data.audience) ? data.audience : []).map(a => (
                <span key={a} className="guide-tag guide-tag--audience">{audienceLabel(a)}</span>
              ))}
            </div>
            <div className="detail-meta">
              <span className="flex items-center gap-2">
                <span className="detail-meta-dot"></span>
                {data.daysCount} jour{data.daysCount > 1 ? 's' : ''}
              </span>
              {data.ownerName && (
                <span className="flex items-center gap-2">
                  <span className="detail-meta-dot"></span>
                  Par {data.ownerName}
                </span>
              )}
            </div>
          </section>

          {/* Days and Activities */}
          <section className="days-list animate-fade-in-up">
            {data.days.map((day, dayIndex) => (
              <div key={day.id} className="day-card animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <span className="day-index">
                    {dayIndex + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {day.title || 'Sans titre'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-2 mt-4">
                  {day.activities.length > 0 ? (
                    day.activities.map((activity, idx) => (
                      <div key={activity.id} className="activity-card">
                        <div className="flex gap-2">
                          <span className="text-xs font-semibold text-gray-600 mt-0.5">{idx + 1}.</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{activity.title}</h3>
                            {activity.description && (
                              <p className="text-gray-700 mt-0.5 text-xs leading-relaxed">{activity.description}</p>
                            )}
                            {(activity.startTime || activity.endTime) && (
                              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <span>&#128336;</span>
                                {activity.startTime && `${activity.startTime}`}
                                {activity.startTime && activity.endTime && ' - '}
                                {activity.endTime && `${activity.endTime}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic">Aucune activité</p>
                  )}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
