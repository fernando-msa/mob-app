'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient, classificarDia, temAlertaRelacao, type Registro, type Classificacao } from '@/lib/supabase'
import { aplicarTema, salvarTemaLocal, type Tema } from '@/lib/profile'
import styles from './page.module.css'

function hojeISO() { return new Date().toISOString().split('T')[0] }
function formatarData(iso: string) {
  const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`
}
const LABEL: Record<Classificacao, string> = {
  pico: '🔴 Pico', fertil: '🟡 Fértil', infertil: '🟢 Infértil',
  sangue: '🔵 Sangramento', nenhum: '⚪ Sem registro',
}
const COR: Record<Classificacao, string> = {
  pico: '#ef4444', fertil: '#eab308', infertil: '#22c55e',
  sangue: '#3b82f6', nenhum: '#d1d5db',
}
function urlBase64ToUint8Array(b64: string) {
  const pad = '='.repeat((4 - b64.length % 4) % 4)
  const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}
const FORM_VAZIO = {
  data: hojeISO(), muco: null as string | null, sensacao: null as string | null,
  sangramento: 'nenhum', relacao: false, observacoes: '',
}

export default function Home() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [temNovidadesNaoVistas, setTemNovidadesNaoVistas] = useState(false)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [pushAtivo, setPushAtivo] = useState(false)
  // Banner de instalação PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mostrarInstalar, setMostrarInstalar] = useState(false)

  // Auth + perfil + redireciona onboarding
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('user_id', user.id).single()

      if (!profile || !profile.onboarding_completo) {
        router.push('/onboarding'); return
      }
      setNome(profile.nome ?? '')
      const tema = (profile.tema ?? 'violeta') as Tema
      aplicarTema(tema); salvarTemaLocal(tema)

      // Verifica novidades não vistas
      const { data: changelog } = await supabase
        .from('changelog').select('versao').order('data', { ascending: false }).limit(1)
      const ultimaVersao = changelog?.[0]?.versao ?? ''
      const visto = typeof localStorage !== 'undefined'
        ? localStorage.getItem('mob-changelog-visto') : ''
      if (ultimaVersao && ultimaVersao !== visto) setTemNovidadesNaoVistas(true)
    }
    init()

    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.push('/auth/login')
    })
    return () => l.subscription.unsubscribe()
  }, [])

  // Captura evento de instalação PWA
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const jaNegou = localStorage.getItem('mob-pwa-negou')
      if (!jaNegou) setMostrarInstalar(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)
    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  async function instalarPWA() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'dismissed') localStorage.setItem('mob-pwa-negou', '1')
    setMostrarInstalar(false)
    setDeferredPrompt(null)
  }

  const carregar = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('registros').select('*')
      .eq('user_id', userId).order('data', { ascending: false }).limit(90)
    if (data) setRegistros(data)
  }, [userId])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    const existente = registros.find(r => r.data === form.data)
    if (existente) {
      setForm({
        data: existente.data, muco: existente.muco, sensacao: existente.sensacao,
        sangramento: existente.sangramento, relacao: existente.relacao ?? false,
        observacoes: existente.observacoes,
      })
    } else {
      setForm(f => ({ ...FORM_VAZIO, data: f.data }))
    }
  }, [form.data, registros])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg =>
        reg.pushManager.getSubscription().then(sub => setPushAtivo(!!sub))
      )
    }
  }, [])

  async function ativarNotificacoes() {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') { setMensagem('Permissão negada.'); return }
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })
    const { endpoint, keys } = sub.toJSON() as any
    await fetch('/api/push/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, keys }),
    })
    setPushAtivo(true)
    setMensagem('✅ Notificações ativadas!')
    setTimeout(() => setMensagem(''), 3000)
  }

  async function salvar() {
    if (!userId) return
    setSalvando(true); setMensagem('')
    const existente = registros.find(r => r.data === form.data)
    const payload = { ...form, user_id: userId, updated_at: new Date().toISOString() }
    const { error } = existente?.id
      ? await supabase.from('registros').update(payload).eq('id', existente.id)
      : await supabase.from('registros').insert(payload)
    if (error) setMensagem('Erro: ' + error.message)
    else { setMensagem('✅ Registro salvo!'); await carregar(); setTimeout(() => setMensagem(''), 3000) }
    setSalvando(false)
  }

  const registroHoje = registros.find(r => r.data === hojeISO()) ?? null
  const classHoje = classificarDia(registroHoje)
  const alertaRelacao = temAlertaRelacao(form as Registro)
  const classForm = classificarDia(form as Registro)
  const saudacao = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  return (
    <main className={styles.main}>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.saudacao}>{saudacao}{nome ? `, ${nome.split(' ')[0]}` : ''}! 👋</p>
          <p className={styles.headerSub}>Método Billings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/calendar" className={styles.iconBtn} title="Calendário">📅</Link>
          <Link href="/changelog" className={styles.iconBtn} title="Novidades" style={{ position: 'relative' }}>
            🆕
            {temNovidadesNaoVistas && <span className={styles.badgeNovo} />}
          </Link>
          <Link href="/profile" className={styles.avatarBtn} style={{ background: 'var(--accent)' }}>
            {nome ? nome.charAt(0).toUpperCase() : '?'}
          </Link>
        </div>
      </header>

      {/* Banner instalar PWA */}
      {mostrarInstalar && (
        <div className={styles.pwaBanner}>
          <div>
            <p className={styles.pwaTitulo}>📲 Instalar o app</p>
            <p className={styles.pwaSub}>Acesse mais rápido direto da tela inicial</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={() => { localStorage.setItem('mob-pwa-negou','1'); setMostrarInstalar(false) }}
              className={styles.pwaNao}>Não</button>
            <button onClick={instalarPWA} className={styles.pwaSim}>Instalar</button>
          </div>
        </div>
      )}

      {/* Resumo hoje */}
      <section className={styles.resumoCard}>
        <p className={styles.resumoLabel}>Hoje · {formatarData(hojeISO())}</p>
        <div className={styles.resumoBadge}>{LABEL[classHoje]}</div>
      </section>

      {/* Formulário */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Registrar observação</h2>

        <label className={styles.label}>Data</label>
        <input type="date" value={form.data} max={hojeISO()}
          onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className={styles.input} />

        <label className={styles.label}>Muco</label>
        <select value={form.muco ?? ''} onChange={e => setForm(f => ({ ...f, muco: e.target.value || null }))} className={styles.input}>
          <option value="">— selecione —</option>
          <option value="seco">Seco</option><option value="nada">Nada</option>
          <option value="espesso">Espesso</option><option value="cremoso">Cremoso</option>
          <option value="elastico">Elástico</option><option value="filante">Filante (em fio)</option>
        </select>

        <label className={styles.label}>Sensação</label>
        <select value={form.sensacao ?? ''} onChange={e => setForm(f => ({ ...f, sensacao: e.target.value || null }))} className={styles.input}>
          <option value="">— selecione —</option>
          <option value="seca">Seca</option><option value="umida">Úmida</option>
          <option value="molhada">Molhada</option><option value="escorregadia">Escorregadia</option>
          <option value="lubricada">Lubrificada</option>
        </select>

        <label className={styles.label}>Sangramento</label>
        <select value={form.sangramento} onChange={e => setForm(f => ({ ...f, sangramento: e.target.value }))} className={styles.input}>
          <option value="nenhum">Nenhum</option><option value="leve">Leve</option>
          <option value="moderado">Moderado</option><option value="intenso">Intenso</option>
        </select>

        <label className={styles.label}>Relação sexual</label>
        <div className={`${styles.relacaoToggle} ${form.relacao ? styles.relacaoAtivo : ''}`}
          onClick={() => setForm(f => ({ ...f, relacao: !f.relacao }))}>
          <div className={styles.relacaoCheck}>{form.relacao ? '✓' : ''}</div>
          <span>{form.relacao ? 'Sim, houve relação' : 'Não houve relação'}</span>
        </div>

        {alertaRelacao && (
          <div className={styles.alertaRelacao}>
            <span>⚠️</span>
            <p>Relação em dia de <strong>{LABEL[classForm]}</strong>. Consulte sua instrutora para orientação personalizada.</p>
          </div>
        )}

        <label className={styles.label}>Observações</label>
        <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
          rows={3} className={styles.input} style={{ resize: 'vertical' }} placeholder="Notas adicionais…" />

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
        <button onClick={salvar} disabled={salvando} className={styles.btnPrimary}>
          {salvando ? 'Salvando…' : 'Salvar registro'}
        </button>
      </section>

      {/* Push */}
      {!pushAtivo && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>🔔 Lembretes diários</h2>
          <p className={styles.mutedText}>Ative notificações para não esquecer de registrar.</p>
          <button onClick={ativarNotificacoes} className={styles.btnSecondary}>Ativar notificações</button>
        </section>
      )}

      {/* Histórico */}
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}>Histórico recente</h2>
          <Link href="/calendar" style={{ fontSize: '0.813rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Ver calendário →
          </Link>
        </div>
        {registros.length === 0 ? (
          <p className={styles.mutedText}>Nenhum registro ainda.</p>
        ) : (
          <ul className={styles.historico}>
            {registros.slice(0, 15).map(r => {
              const c = classificarDia(r); const alerta = temAlertaRelacao(r)
              return (
                <li key={r.id} className={styles.historicoItem}
                  onClick={() => setForm(f => ({ ...f, data: r.data }))}
                  style={{ borderLeft: `4px solid ${COR[c]}` }}>
                  <span className={styles.historicoData}>{formatarData(r.data)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {alerta && <span>⚠️</span>}
                    {r.relacao && !alerta && <span>💑</span>}
                    <span style={{ color: COR[c], fontWeight: 600, fontSize: '0.875rem' }}>{LABEL[c]}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Links de rodapé */}
      <div className={styles.rodape}>
        <Link href="/feedback" className={styles.rodapeLink}>💬 Feedback</Link>
        <Link href="/changelog" className={styles.rodapeLink}>
          🆕 Novidades {temNovidadesNaoVistas && <span className={styles.rodapeNovo}>●</span>}
        </Link>
      </div>

    </main>
  )
}
