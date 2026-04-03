import { Mobility, Season, Audience } from './types';

const MOBILITY_LABELS: Record<Mobility, string> = {
  voiture: 'Voiture',
  velo: 'Vélo',
  a_pied: 'À pied',
  moto: 'Moto',
};

const SEASON_LABELS: Record<Season, string> = {
  ete: 'Été',
  printemps: 'Printemps',
  automne: 'Automne',
  hiver: 'Hiver',
};

const AUDIENCE_LABELS: Record<Audience, string> = {
  famille: 'Famille',
  seul: 'Seul',
  groupe: 'En groupe',
  entre_amis: 'Entre amis',
};

export function mobilityLabel(m: Mobility): string {
  return MOBILITY_LABELS[m] ?? m;
}

export function seasonLabel(s: Season): string {
  return SEASON_LABELS[s] ?? s;
}

export function audienceLabel(a: Audience): string {
  return AUDIENCE_LABELS[a] ?? a;
}
