'use client'

import { useEffect } from 'react'
import { aplicarTema, lerTemaLocal } from '@/lib/profile'

export default function ThemeLoader() {
  useEffect(() => {
    aplicarTema(lerTemaLocal())
  }, [])
  return null
}
