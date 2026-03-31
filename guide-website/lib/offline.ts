// src/lib/offline.ts
import { Guide } from './types';

const GUIDES_KEY = 'guides_cache';

export function saveGuidesToCache(guides: Guide[]) {
  localStorage.setItem(GUIDES_KEY, JSON.stringify(guides));
}

export function getGuidesFromCache(): Guide[] | null {
  const raw = localStorage.getItem(GUIDES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}