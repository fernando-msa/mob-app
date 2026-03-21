import type { Metadata, Viewport } from 'next'
import './globals.css'
import ThemeLoader from './ThemeLoader'

export const metadata: Metadata = {
  title: 'Método Billings',
  description: 'Registro diário do Método de Ovulação Billings',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Método Billings' },
  formatDetection: { telephone: false },
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeLoader />
        {children}
      </body>
    </html>
  )
}
