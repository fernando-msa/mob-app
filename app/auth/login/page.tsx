'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

type Modo = 'magiclink' | 'senha'

export default function LoginPage() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [modo, setModo] = useState<Modo>('senha')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErro('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErro(error.message)
    else setEnviado(true)
    setLoading(false)
  }

  async function handleSenha(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      )
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <h1 className={styles.logoTitle}>Método Billings</h1>
          <p className={styles.logoSub}>Diário do ciclo</p>
        </div>

        <div className={styles.aviso}>
          <span className={styles.avisoIcon}>⚕️</span>
          <p className={styles.avisoText}>
            Este app é um <strong>auxiliar de registro pessoal</strong>. Para interpretação
            segura e personalizada do ciclo, especialmente nos primeiros meses, consulte sempre
            uma <strong>instrutora certificada do MOB</strong> ou seu <strong>ginecologista</strong>.
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${modo === 'senha' ? styles.tabActive : ''}`}
            onClick={() => { setModo('senha'); setErro(''); setEnviado(false) }}
          >
            E-mail e senha
          </button>
          <button
            className={`${styles.tab} ${modo === 'magiclink' ? styles.tabActive : ''}`}
            onClick={() => { setModo('magiclink'); setErro(''); setEnviado(false) }}
          >
            Magic Link
          </button>
        </div>

        {modo === 'magiclink' && (
          enviado ? (
            <div className={styles.enviado}>
              <span style={{ fontSize: '2.5rem' }}>📬</span>
              <h2>Link enviado!</h2>
              <p>Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para entrar.</p>
              <button className={styles.linkBtn} onClick={() => { setEnviado(false); setEmail('') }}>
                Usar outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className={styles.form}>
              <label className={styles.label}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required className={styles.input} />
              {erro && <p className={styles.erro}>{erro}</p>}
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? 'Enviando…' : 'Enviar Magic Link'}
              </button>
              <p className={styles.hint}>Você receberá um link por e-mail sem precisar de senha.</p>
            </form>
          )
        )}

        {modo === 'senha' && (
          <form onSubmit={handleSenha} className={styles.form}>
            <label className={styles.label}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required className={styles.input} />
            <label className={styles.label}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••" required minLength={6} className={styles.input} />
            {erro && <p className={styles.erro}>{erro}</p>}
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
            <div className={styles.linksRow}>
              <a href="/auth/forgot" className={styles.linkBtn}>Esqueceu a senha?</a>
              <a href="/auth/signup" className={styles.linkBtn}>Criar conta</a>
            </div>
          </form>
        )}

      </div>
    </main>
  )
}
