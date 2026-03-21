'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

// Mensagens de erro humanizadas
function traduzirErro(msg: string, onEsqueceu: () => void) {
  if (msg.includes('Invalid login credentials')) {
    return (
      <p className={styles.erroTexto}>
        E-mail ou senha incorretos.{' '}
        <button className={styles.erroLink} onClick={onEsqueceu}>
          Esqueceu a senha?
        </button>
      </p>
    )
  }
  if (msg.includes('Email not confirmed')) {
    return (
      <p className={styles.erroTexto}>
        Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.
      </p>
    )
  }
  if (msg.includes('Too many requests')) {
    return (
      <p className={styles.erroTexto}>
        Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.
      </p>
    )
  }
  return <p className={styles.erroTexto}>{msg}</p>
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Lembrar e-mail
  useEffect(() => {
    const emailSalvo = localStorage.getItem('mob-email-salvo')
    if (emailSalvo) setEmail(emailSalvo)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErro('')

    localStorage.setItem('mob-email-salvo', email)

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro(error.message)
    } else {
      router.push('/')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <span className={styles.logoIcon}>🌿</span>
          <h1 className={styles.logoTitle}>Método Billings</h1>
          <p className={styles.logoSub}>Diário do ciclo</p>
        </div>

        {/* Formulário */}
        <div className={styles.body}>
          <form onSubmit={handleLogin} className={styles.form}>

            <label className={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className={styles.input}
            />

            <label className={styles.label}>Senha</label>
            <div className={styles.senhaWrap}>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
                className={styles.input}
              />
              <button
                type="button"
                className={styles.senhaToggle}
                onClick={() => setMostrarSenha(v => !v)}
                tabIndex={-1}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? '🙈' : '👁️'}
              </button>
            </div>

            {erro && (
              <div className={styles.erroBox}>
                <span className={styles.erroIcon}>⚠️</span>
                {traduzirErro(erro, () => router.push('/auth/forgot'))}
              </div>
            )}

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>

            <div className={styles.linksRow}>
              <a href="/auth/forgot" className={styles.linkBtn}>Esqueceu a senha?</a>
              <a href="/auth/signup" className={styles.linkBtn}>Criar conta</a>
            </div>

          </form>

          <p className={styles.avisoDiscret}>
            ⚕️ Este app não substitui orientação de instrutora certificada ou ginecologista.
          </p>
        </div>

      </div>
    </main>
  )
}
