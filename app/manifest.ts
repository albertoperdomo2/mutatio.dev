import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mutatio.dev - Prompt Engineering Platform',
    short_name: 'Mutatio',
    description: 'A modern LLM prompt experimentation platform for systematic prompt mutation and validation',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8a2be2',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}