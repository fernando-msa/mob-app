// Client-only — sem imports de next/headers
import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// ─── Tipos ───────────────────────────────────────────────────────────────────
export type Registro = {
  id?: string
  user_id?: string
  data: string
  muco: string | null
  sensacao: string | null
  sangramento: string
  relacao: boolean          // teve relação sexual no dia
  observacoes: string
  created_at?: string
  updated_at?: string
}

export type Classificacao = 'infertil' | 'fertil' | 'pico' | 'sangue' | 'nenhum'

export function classificarDia(r: Registro | null): Classificacao {
  if (!r) return 'nenhum'
  if (r.sangramento && r.sangramento !== 'nenhum') return 'sangue'
  const m = r.muco
  const s = r.sensacao
  if (m === 'filante' || s === 'escorregadia' || s === 'lubricada') return 'pico'
  if (m === 'elastico' || m === 'cremoso' || s === 'molhada' || s === 'umida') return 'fertil'
  if (m === 'seco' || m === 'nada' || s === 'seca') return 'infertil'
  return 'nenhum'
}

// Relação em dia fértil/pico = alerta especial
export function temAlertaRelacao(r: Registro | null): boolean {
  if (!r || !r.relacao) return false
  const c = classificarDia(r)
  return c === 'fertil' || c === 'pico'
}
