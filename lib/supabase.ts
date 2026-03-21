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
  relacao: boolean
  observacoes: string
  created_at?: string
  updated_at?: string
}

export type Classificacao =
  | 'infertil'
  | 'fertil'
  | 'pico'
  | 'pos_pico'   // 3 dias após o pico — ainda fértil
  | 'sangue'
  | 'nenhum'

export type InfoDia = {
  classificacao: Classificacao
  ehPico: boolean          // pico identificado neste dia
  diasAposPico: number     // 0 = não é pós-pico, 1-3 = dias pós-pico
  alertaRelacao: boolean
}

/** Classifica apenas o dia isolado (sem contexto) */
export function classificarDiaIsolado(r: Registro | null): Classificacao {
  if (!r) return 'nenhum'
  if (r.sangramento && r.sangramento !== 'nenhum') return 'sangue'
  const m = r.muco
  const s = r.sensacao
  if (m === 'filante' || s === 'escorregadia' || s === 'lubricada') return 'pico'
  if (m === 'elastico' || m === 'cremoso' || s === 'molhada' || s === 'umida') return 'fertil'
  if (m === 'seco' || m === 'nada' || s === 'seca') return 'infertil'
  return 'nenhum'
}

/**
 * Classifica com contexto — aplica a regra dos 3 dias pós-pico.
 * Recebe o array completo de registros ordenado por data crescente.
 */
export function classificarComContexto(
  registros: Registro[],
  data: string
): InfoDia {
  const r = registros.find(x => x.data === data) ?? null
  const classeBase = classificarDiaIsolado(r)

  // Encontra o pico mais recente antes desta data
  const dataAtual = new Date(data)
  let diasAposPico = 0

  for (let d = 1; d <= 3; d++) {
    const dataAntes = new Date(dataAtual)
    dataAntes.setDate(dataAtual.getDate() - d)
    const isoAntes = dataAntes.toISOString().split('T')[0]
    const rAntes = registros.find(x => x.data === isoAntes)
    if (rAntes && classificarDiaIsolado(rAntes) === 'pico') {
      diasAposPico = d
      break
    }
  }

  // Aplica regra: 3 dias após pico são pós-pico (ainda férteis)
  let classificacao: Classificacao = classeBase
  if (diasAposPico > 0 && classeBase !== 'sangue' && classeBase !== 'pico') {
    classificacao = 'pos_pico'
  }

  const alertaRelacao =
    !!r?.relacao &&
    (classificacao === 'fertil' ||
      classificacao === 'pico' ||
      classificacao === 'pos_pico')

  return {
    classificacao,
    ehPico: classeBase === 'pico',
    diasAposPico,
    alertaRelacao,
  }
}

/** Atalho para uso legado sem contexto */
export function classificarDia(r: Registro | null): Classificacao {
  return classificarDiaIsolado(r)
}

export function temAlertaRelacao(r: Registro | null): boolean {
  if (!r || !r.relacao) return false
  const c = classificarDia(r)
  return c === 'fertil' || c === 'pico'
}

// ─── Constantes de UI ────────────────────────────────────────────────────────
export const LABEL_CLASS: Record<Classificacao, string> = {
  pico:     '🔴 Pico',
  pos_pico: '🟠 Pós-pico',
  fertil:   '🟡 Fértil',
  infertil: '🟢 Infértil',
  sangue:   '🔵 Sangramento',
  nenhum:   '⚪ Sem registro',
}

export const COR_CLASS: Record<Classificacao, string> = {
  pico:     '#ef4444',
  pos_pico: '#f97316',
  fertil:   '#eab308',
  infertil: '#22c55e',
  sangue:   '#3b82f6',
  nenhum:   '#d1d5db',
}
