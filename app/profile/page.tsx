'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'
import { TEMAS, aplicarTema, salvarTemaLocal, type Tema } from '@/lib/profile'
import styles from './profile.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [tema, setTema] = useState<Tema>('violeta')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) { setNome(data.nome ?? ''); setTema(data.tema ?? 'violeta') }
      setLoading(false)
    }
    carregar()
  }, [])

  useEffect(() => { aplicarTema(tema); salvarTemaLocal(tema) }, [tema])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSalvando(true); setMensagem('')
    await supabase.from('profiles').upsert({
      user_id: userId, nome: nome.trim(), tema,
      onboarding_completo: true, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setMensagem('✅ Perfil atualizado!')
    setTimeout(() => setMensagem(''), 3000)
    setSalvando(false)
  }

  if (loading) return (
    <main className={styles.main}>
      <div className={styles.loading}>Carregando perfil…</div>
    </main>
  )

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Meu Perfil</h1>
        <div style={{ width: '4rem' }} />
      </header>

      {/* Avatar inicial */}
      <div className={styles.avatarArea}>
        <div className={styles.avatar} style={{ background: 'var(--accent)' }}>
          {nome ? nome.charAt(0).toUpperCase() : '?'}
        </div>
        <p className={styles.avatarNome}>{nome || 'Sem nome'}</p>
        <p className={styles.avatarEmail}>{email}</p>
      </div>

      <form onSubmit={salvar} className={styles.card}>
        <h2 className={styles.cardTitle}>Informações pessoais</h2>

        <label className={styles.label}>Como quer ser chamada</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Seu nome ou apelido" maxLength={40} className={styles.input} />

        <label className={styles.label}>Tema de cor</label>
        <div className={styles.temaGrade}>
          {TEMAS.map(t => (
            <button key={t.valor} type="button"
              onClick={() => setTema(t.valor)}
              className={`${styles.temaBtn} ${tema === t.valor ? styles.temaBtnAtivo : ''}`}
              style={{
                borderColor: tema === t.valor ? t.cor : 'transparent',
                background: tema === t.valor ? t.cor + '18' : 'var(--bg)',
              }}
            >
              <span className={styles.temaCircle} style={{ background: t.cor }} />
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <button type="submit" disabled={salvando || !nome.trim()} className={styles.btnPrimary}>
          {salvando ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>

      {/* Ações da conta */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Conta</h2>
        <div className={styles.contaLinks}>
          <Link href="/changelog" className={styles.contaItem}>
            <span>🆕</span><span>Novidades do app</span><span className={styles.chevron}>›</span>
          </Link>
          <Link href="/feedback" className={styles.contaItem}>
            <span>💬</span><span>Enviar feedback</span><span className={styles.chevron}>›</span>
          </Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
            className={styles.contaItemDanger}>
            <span>🚪</span><span>Sair da conta</span><span className={styles.chevron}>›</span>
          </button>
        </div>
      </div>
    </main>
  )
}
