import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MOB App',
  description: 'Método de Ovulação Billings',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#d63384',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
