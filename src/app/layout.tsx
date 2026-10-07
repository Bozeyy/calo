import type { Metadata } from 'next'
import './globals.css'

import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#1ea858',
}

export const metadata: Metadata = {
  title: 'Calo — Suivi des calories',
  description: 'Suivez vos calories et macronutriments au quotidien',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calo',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
