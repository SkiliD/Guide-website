export type Role = 'admin' | 'user';

export type Mobility = 'voiture' | 'velo' | 'a_pied' | 'moto';
export type Season = 'ete' | 'printemps' | 'automne' | 'hiver';
export type Audience = 'famille' | 'seul' | 'groupe' | 'entre_amis';
export type ActivityCategory = 'musee' | 'chateau' | 'activite' | 'parc' | 'grotte';

export type AuthPayload = {
  userId: string;
  role: Role;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

export type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  address: string;
  phone: string;
  openingHours: string;
  website: string;
  startTime?: string;
  endTime?: string;
};

export type DayActivityRef = {
  activityId: string;
  order: number;
};

export type DayRecord = {
  id: string;
  dayNumber: number;
  date: string;
  title?: string;
  activityRefs: DayActivityRef[];
};

export type GuideRecord = {
  id: string;
  title: string;
  description: string;
  daysCount: number;
  mobility: Mobility[];
  season: Season[];
  audience: Audience[];
  ownerId: string;
  memberIds: string[];
  days: DayRecord[];
  activities: ActivityRecord[];
  createdAt: string;
  updatedAt: string;
};

export type FrontActivity = {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
};

export type FrontDay = {
  id: string;
  date: string;
  title?: string;
  activities: FrontActivity[];
};

export type FrontGuide = {
  id: string;
  title: string;
  description?: string;
  mobility: Mobility[];
  season: Season[];
  audience: Audience[];
  daysCount: number;
  days: FrontDay[];
  ownerName?: string;
  isShared?: boolean;
};
