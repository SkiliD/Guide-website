import { Guide } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

const mockGuides: Guide[] = [
  {
    id: '1',
    title: 'Voyage a Tokyo',
    description: 'Une semaine au Japon',
    ownerName: 'Henri',
    isShared: true,
    days: [
      {
        id: 'd1',
        date: '2024-05-01',
        title: 'Premiere journee',
        activities: [
          { id: 'a1', title: 'Visite du temple Senso-ji' },
          { id: 'a2', title: 'Diner a Shibuya' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Road trip Italie',
    description: 'Florence, Rome, Naples',
    ownerName: 'Claire',
    isShared: false,
    days: []
  }
];

export async function fetchGuides(): Promise<Guide[]> {
  if (USE_MOCK_DATA || !API_URL) {
    await new Promise((r) => setTimeout(r, 500));
    return mockGuides;
  }

  const res = await fetch(`${API_URL}/guides`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des guides');
  }

  return res.json();
}

export async function fetchGuide(id: string): Promise<Guide> {
  if (USE_MOCK_DATA || !API_URL) {
    await new Promise((r) => setTimeout(r, 200));
    const guide = mockGuides.find((g) => g.id === id);
    if (!guide) {
      throw new Error('Guide introuvable');
    }
    return guide;
  }

  const res = await fetch(`${API_URL}/guides/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Erreur lors du chargement du guide');
  }

  return res.json();
}

export function isMockModeEnabled(): boolean {
  return USE_MOCK_DATA || !API_URL;
}
