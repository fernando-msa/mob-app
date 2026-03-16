import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Método Billings',
  description: 'Registro do Método de Ovulação Billings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
