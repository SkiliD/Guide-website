import { Guide } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/*export async function fetchGuides(): Promise<Guide[]> {
  const res = await fetch(`${API_URL}/guides`);
  if (!res.ok) throw new Error('Erreur lors du chargement des guides');
  return res.json();
}

export async function fetchGuide(id: string): Promise<Guide> {
  const res = await fetch(`${API_URL}/guides/${id}`);
  if (!res.ok) throw new Error('Erreur lors du chargement du guide');
  return res.json();
}*/

export async function fetchGuides(): Promise<Guide[]> {
  // Simule un délai réseau
  await new Promise((r) => setTimeout(r, 500));

  return [
    {
      id: "1",
      title: "Voyage à Tokyo",
      description: "Une semaine au Japon",
      days: [
        {
          id: "d1",
          date: "2024-05-01",
          activities: [
            { id: "a1", title: "Visite du temple Senso-ji" },
            { id: "a2", title: "Dîner à Shibuya" }
          ]
        }
      ]
    },
    {
      id: "2",
      title: "Road trip Italie",
      description: "Florence, Rome, Naples",
      days: []
    }
  ];
}
