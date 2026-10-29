import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Bhavani Science Classes',
    short_name: 'Bhavani STEM',
    description: 'Official portal for Bhavani Science Classes (Virar West) - Student timetable, marks, fees, and lectures.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF8FF',
    theme_color: '#0F294A',
    icons: [
      {
        src: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/aistudio/Bhavani_Science_Class_logo_92f62a8f.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
