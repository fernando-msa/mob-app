'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function SignupPage() {
  const supabase = getBrowserClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setErro(
        error.message === 'User already registered'
          ? 'Este e-mail já possui uma conta. Faça login.'
          : error.message
      )
    } else {
      setEnviado(true)
    }
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌿</span>
          <h1 className={styles.logoTitle}>Criar conta</h1>
          <p className={styles.logoSub}>Método de Ovulação Billings</p>
        </div>

        {enviado ? (
          <div className={styles.enviado}>
            <span style={{ fontSize: '2.5rem' }}>📬</span>
            <h2>Confirme seu e-mail</h2>
            <p>
              Enviamos um link de confirmação para <strong>{email}</strong>.
              Clique nele para ativar sua conta.
            </p>
            <a href="/auth/login" className={styles.linkBtn}>Ir para o login</a>
          </div>
        ) : (
          <form onSubmit={handleSignup} className={styles.form}>
            <label className={styles.label}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required className={styles.input} />

            <label className={styles.label}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres" required minLength={6} className={styles.input} />

            <label className={styles.label}>Confirmar senha</label>
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Repita a senha" required minLength={6} className={styles.input} />

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>

            <div className={styles.linksRow}>
              <span />
              <a href="/auth/login" className={styles.linkBtn}>Já tenho conta</a>
            </div>
          </form>
        )}

      </div>
    </main>
  )
}
