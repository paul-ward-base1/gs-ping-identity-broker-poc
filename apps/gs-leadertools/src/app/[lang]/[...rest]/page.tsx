import { notFound } from 'next/navigation';

export default function CatchAllNotFound() {
  notFound(); // this will trigger the localized [lang]/not-found.tsx
}
