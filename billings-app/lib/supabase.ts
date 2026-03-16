import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'
    )
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop]
  },
})

export type Registro = {
  id?: string
  data: string
  muco: string | null
  sensacao: string | null
  sangramento: string
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
