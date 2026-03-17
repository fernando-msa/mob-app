import { createBrowserClient } from '@supabase/ssr';

// Cria o cliente Supabase para uso no lado do browser (Client Components)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Registro = {
  id?: string
  user_id?: string
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
