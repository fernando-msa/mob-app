// ─── Browser (Client Components) ────────────────────────────────────────────
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Instância singleton para uso em Client Components
let _browserClient: ReturnType<typeof createBrowserClient> | null = null
export function getBrowserClient() {
  if (!_browserClient) _browserClient = createClient()
  return _browserClient
}

// ─── Server (Server Components / Route Handlers) ─────────────────────────────
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies só podem ser escritos em Route Handlers
          }
        },
      },
    }
  )
}

// ─── Tipos ───────────────────────────────────────────────────────────────────
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

export type PushSubscriptionRecord = {
  id?: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at?: string
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
