// src/components/GuideCard.tsx
import Link from 'next/link';
import { Guide } from '@/lib/types';
import { motion } from 'framer-motion';

type Props = { guide: Guide };

export function GuideCard({ guide }: Props) {
  return (
<div
  className="
    bg-white 
    rounded-2xl 
    shadow-lg 
    overflow-hidden 
    hover:shadow-2xl 
    hover:-translate-y-1 
    transition 
    cursor-pointer
  "
>
  <div className="h-40 bg-gradient-to-r from-indigo-500 to-pink-500" />

  <div className="p-4">
    <h2 className="text-xl font-bold text-gray-800">{guide.title}</h2>
    <p className="text-gray-600 text-sm mt-1">{guide.description}</p>

    <div className="mt-4 flex justify-between items-center">
      <span className="text-gray-500 text-sm">
        {guide.days.length} jour(s)
      </span>

      <a
        href={`/guides/${guide.id}`}
        className="text-indigo-600 font-semibold hover:underline"
      >
        Voir →
      </a>
    </div>
  </div>
</div>

  );
}