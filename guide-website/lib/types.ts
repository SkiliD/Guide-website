// src/lib/types.ts
export type Activity = {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
};

export type Day = {
  id: string;
  date: string; // ISO
  title?: string;
  activities: Activity[];
};

export type Mobility = 'voiture' | 'velo' | 'a_pied' | 'moto';
export type Season = 'ete' | 'printemps' | 'automne' | 'hiver';
export type Audience = 'famille' | 'seul' | 'groupe' | 'entre_amis';

export type Guide = {
  id: string;
  title: string;
  description?: string;
  mobility: Mobility[];
  season: Season[];
  audience: Audience[];
  daysCount: number;
  days: Day[];
  ownerName?: string;
  isShared?: boolean;
};