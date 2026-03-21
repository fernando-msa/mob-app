'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function ForgotPage() {
  const supabase = getBrowserClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    // Sempre exibe sucesso — não revela se o e-mail existe
    setEnviado(true)
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <span className={styles.logoIcon}>🔑</span>
          <h1 className={styles.logoTitle}>Recuperar acesso</h1>
          <p className={styles.logoSub}>Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className={styles.body}>
          {enviado ? (
            <div className={styles.enviado}>
              <span style={{ fontSize: '3rem' }}>📬</span>
              <h2>E-mail enviado!</h2>
              <p>
                Se houver uma conta com <strong>{email}</strong>, você receberá
                um link em instantes. Verifique também a pasta de spam.
              </p>
              <a href="/auth/login" className={styles.linkBtn} style={{ marginTop: '0.75rem' }}>
                Voltar ao login
              </a>
            </div>
          ) : (
            <form onSubmit={handleForgot} className={styles.form}>
              <label className={styles.label}>E-mail da conta</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required autoComplete="email"
                className={styles.input}
              />

              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>

              <a href="/auth/login" className={styles.voltarLink}>← Voltar ao login</a>
            </form>
          )}
        </div>

      </div>
    </main>
  )
}
