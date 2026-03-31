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

  if (isLoading) return <p>Chargement du guide...</p>;
  if (isError || !data) return <p>Impossible de charger ce guide.</p>;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
    <button
    onClick={() => router.push("/")}
    className="inline-flex items-center text-blue-600 hover:underline"
    >
    ← Retour
    </button>


    <h1 className="text-3xl font-bold">{data.title}</h1>

    {data.description && (
        <p className="text-gray-700 leading-relaxed">{data.description}</p>
    )}

    <section className="space-y-4">
        {data.days.map((day) => (
        <div
            key={day.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
        >
            <h2 className="font-semibold text-lg">
            {day.title || new Date(day.date).toLocaleDateString('fr-FR')}
            </h2>

            <ul className="mt-3 space-y-2">
            {day.activities.map((act) => (
                <li key={act.id} className="text-sm">
                <span className="font-medium">{act.title}</span>
                {act.description && (
                    <span className="text-gray-600"> — {act.description}</span>
                )}
                </li>
            ))}
            </ul>
        </div>
        ))}
    </section>
    </main>
  );
}