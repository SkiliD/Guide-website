'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchGuides } from '@/lib/api';
import { Guide } from '@/lib/types';
import { useRouter } from "next/navigation";

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery<Guide>({
    queryKey: ['guide', id],
    queryFn: async () => {
      const guides = await fetchGuides();
      const guide = guides.find(g => g.id === id);
      if (!guide) throw new Error("Guide introuvable");
      return guide;
    },
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600">Chargement du guide...</p>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">Impossible de charger ce guide</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm animate-fade-in-down">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 font-medium text-sm md:text-base bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md active:scale-95 group"
          >
            <span className="transform group-hover:-translate-x-0.5 transition-transform">
              ←
            </span>
            <span className="hidden sm:inline">Retour</span>
          </button>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            data.isShared ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {data.isShared ? 'Partagé' : 'Privé'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        
        {/* Title and Description */}
        <section className="space-y-3 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {data.title}
          </h1>
          {data.description && (
            <p className="text-gray-700 text-lg leading-relaxed">{data.description}</p>
          )}
          <div className="mt-5 flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {data.days.length} jour{data.days.length > 1 ? 's' : ''}
            </span>
            {data.ownerName && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Par {data.ownerName}
              </span>
            )}
          </div>
        </section>

        {/* Days and Activities */}
        <section className="space-y-7 animate-fade-in-up">
          {data.days.map((day, dayIndex) => (
            <div key={day.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition border border-gray-200 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded flex items-center justify-center">
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
                    <div key={activity.id} className="bg-slate-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex gap-2">
                        <span className="text-xs font-semibold text-gray-600 mt-0.5">{idx + 1}.</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{activity.title}</h3>
                          {activity.description && (
                            <p className="text-gray-700 mt-0.5 text-xs leading-relaxed">{activity.description}</p>
                          )}
                          {(activity.startTime || activity.endTime) && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <span>🕐</span>
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
  );
}