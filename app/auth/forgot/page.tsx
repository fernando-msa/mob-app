'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function ForgotPage() {
  const supabase = getBrowserClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErro('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    // Por segurança, sempre exibe sucesso (não revela se e-mail existe)
    if (error) console.error(error)
    setEnviado(true)
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔑</span>
          <h1 className={styles.logoTitle}>Esqueceu a senha?</h1>
          <p className={styles.logoSub}>Vamos te ajudar a recuperar o acesso</p>
        </div>

        {enviado ? (
          <div className={styles.enviado}>
            <span style={{ fontSize: '2.5rem' }}>📬</span>
            <h2>E-mail enviado!</h2>
            <p>
              Se houver uma conta com <strong>{email}</strong>, você receberá
              um link para redefinir sua senha. Verifique também a pasta de spam.
            </p>
            <a href="/auth/login" className={styles.linkBtn}>Voltar ao login</a>
          </div>
        ) : (
          <form onSubmit={handleForgot} className={styles.form}>
            <label className={styles.label}>E-mail da conta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className={styles.input}
            />
            {erro && <p className={styles.erro}>{erro}</p>}
            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>
            <a href="/auth/login" className={styles.voltarLink}>← Voltar ao login</a>
          </form>
        )}

      </div>
    </main>
  )
}
