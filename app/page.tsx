'use client'

import { useEffect, useState, useCallback } from 'react'
import { getBrowserClient, classificarDia, type Registro, type Classificacao } from '@/lib/supabase'
import styles from './page.module.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hojeISO() {
  return new Date().toISOString().split('T')[0]
}

function formatarData(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function labelClassificacao(c: Classificacao) {
  const map: Record<Classificacao, string> = {
    pico: '🔴 Pico',
    fertil: '🟡 Fértil',
    infertil: '🟢 Infértil',
    sangue: '🔵 Sangramento',
    nenhum: '⚪ Sem registro',
  }
  return map[c]
}

const COR: Record<Classificacao, string> = {
  pico: '#ef4444',
  fertil: '#eab308',
  infertil: '#22c55e',
  sangue: '#3b82f6',
  nenhum: '#d1d5db',
}

// ─── Push helpers ─────────────────────────────────────────────────────────────
async function registrarPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  })
  return sub
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Home() {
  const supabase = getBrowserClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [hoje, setHoje] = useState(hojeISO())
  const [form, setForm] = useState<Omit<Registro, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    data: hojeISO(),
    muco: null,
    sensacao: null,
    sangramento: 'nenhum',
    observacoes: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [pushAtivo, setPushAtivo] = useState(false)

  // Autenticação
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Carrega registros
  const carregarRegistros = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', userId)
      .order('data', { ascending: false })
      .limit(90)
    if (data) setRegistros(data)
  }, [userId])

  useEffect(() => { carregarRegistros() }, [carregarRegistros])

  // Preenche form com registro do dia selecionado (se existir)
  useEffect(() => {
    const existente = registros.find(r => r.data === form.data)
    if (existente) {
      setForm({
        data: existente.data,
        muco: existente.muco,
        sensacao: existente.sensacao,
        sangramento: existente.sangramento,
        observacoes: existente.observacoes,
      })
    } else {
      setForm(f => ({ ...f, muco: null, sensacao: null, sangramento: 'nenhum', observacoes: '' }))
    }
  }, [form.data, registros])

  // Verifica se push já está ativo
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setPushAtivo(!!sub))
      )
    }
  }, [])

  async function ativarNotificacoes() {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setMensagem('Permissão negada para notificações.')
      return
    }
    const sub = await registrarPush()
    if (!sub) return
    const { endpoint, keys } = sub.toJSON() as any
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, keys }),
    })
    setPushAtivo(true)
    setMensagem('✅ Notificações ativadas!')
    setTimeout(() => setMensagem(''), 3000)
  }

  async function salvar() {
    if (!userId) return
    setSalvando(true)
    setMensagem('')

    const existente = registros.find(r => r.data === form.data)
    const payload = { ...form, user_id: userId, updated_at: new Date().toISOString() }

    let error: any
    if (existente?.id) {
      ({ error } = await supabase.from('registros').update(payload).eq('id', existente.id))
    } else {
      ({ error } = await supabase.from('registros').insert(payload))
    }

    if (error) {
      setMensagem('Erro ao salvar: ' + error.message)
    } else {
      setMensagem('✅ Registro salvo!')
      await carregarRegistros()
      setTimeout(() => setMensagem(''), 3000)
    }
    setSalvando(false)
  }

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const classificacaoHoje = classificarDia(registros.find(r => r.data === hoje) ?? null)

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <span className={styles.headerTitle}>Método Billings</span>
        </div>
        <button onClick={sair} className={styles.sairBtn}>Sair</button>
      </header>

      {/* Card resumo do dia */}
      <section className={styles.resumoCard}>
        <p className={styles.resumoLabel}>Hoje · {formatarData(hoje)}</p>
        <div
          className={styles.resumoBadge}
          style={{ background: COR[classificacaoHoje] + '22', color: COR[classificacaoHoje] }}
        >
          {labelClassificacao(classificacaoHoje)}
        </div>
      </section>

      {/* Formulário */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Registrar observação</h2>

        <label className={styles.label}>Data</label>
        <input
          type="date"
          value={form.data}
          max={hojeISO()}
          onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
          className={styles.input}
        />

        <label className={styles.label}>Muco</label>
        <select value={form.muco ?? ''} onChange={e => setForm(f => ({ ...f, muco: e.target.value || null }))} className={styles.input}>
          <option value="">— selecione —</option>
          <option value="seco">Seco</option>
          <option value="nada">Nada</option>
          <option value="espesso">Espesso</option>
          <option value="cremoso">Cremoso</option>
          <option value="elastico">Elástico</option>
          <option value="filante">Filante (em fio)</option>
        </select>

        <label className={styles.label}>Sensação</label>
        <select value={form.sensacao ?? ''} onChange={e => setForm(f => ({ ...f, sensacao: e.target.value || null }))} className={styles.input}>
          <option value="">— selecione —</option>
          <option value="seca">Seca</option>
          <option value="umida">Úmida</option>
          <option value="molhada">Molhada</option>
          <option value="escorregadia">Escorregadia</option>
          <option value="lubricada">Lubrificada</option>
        </select>

        <label className={styles.label}>Sangramento</label>
        <select value={form.sangramento} onChange={e => setForm(f => ({ ...f, sangramento: e.target.value }))} className={styles.input}>
          <option value="nenhum">Nenhum</option>
          <option value="leve">Leve</option>
          <option value="moderado">Moderado</option>
          <option value="intenso">Intenso</option>
        </select>

        <label className={styles.label}>Observações</label>
        <textarea
          value={form.observacoes}
          onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          rows={3}
          className={styles.input}
          style={{ resize: 'vertical' }}
          placeholder="Notas adicionais…"
        />

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <button onClick={salvar} disabled={salvando} className={styles.btnPrimary}>
          {salvando ? 'Salvando…' : 'Salvar registro'}
        </button>
      </section>

      {/* Notificações push */}
      {!pushAtivo && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>🔔 Lembretes diários</h2>
          <p className={styles.mutedText}>Ative notificações para receber um lembrete diário para registrar suas observações.</p>
          <button onClick={ativarNotificacoes} className={styles.btnSecondary}>
            Ativar notificações
          </button>
        </section>
      )}

      {/* Histórico */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Histórico recente</h2>
        {registros.length === 0 ? (
          <p className={styles.mutedText}>Nenhum registro ainda.</p>
        ) : (
          <ul className={styles.historico}>
            {registros.slice(0, 30).map(r => {
              const c = classificarDia(r)
              return (
                <li
                  key={r.id}
                  className={styles.historicoItem}
                  onClick={() => setForm(f => ({ ...f, data: r.data }))}
                  style={{ borderLeft: `4px solid ${COR[c]}` }}
                >
                  <span className={styles.historicoData}>{formatarData(r.data)}</span>
                  <span style={{ color: COR[c], fontWeight: 600, fontSize: '0.875rem' }}>
                    {labelClassificacao(c)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
