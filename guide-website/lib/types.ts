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

export type Guide = {
  id: string;
  title: string;
  description?: string;
  days: Day[];
  ownerName?: string;
  isShared?: boolean;
};