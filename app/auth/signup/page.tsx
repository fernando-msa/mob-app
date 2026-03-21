'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

function traduzirErro(msg: string) {
  if (msg.includes('User already registered'))
    return 'Já existe uma conta com este e-mail. Tente fazer login.'
  if (msg.includes('Password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email'))
    return 'E-mail inválido. Verifique e tente novamente.'
  return msg
}

export default function SignupPage() {
  const supabase = getBrowserClient()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6)    { setErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErro(traduzirErro(error.message))
    else setEnviado(true)
    setLoading(false)
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <span className={styles.logoIcon}>🌱</span>
          <h1 className={styles.logoTitle}>Criar conta</h1>
          <p className={styles.logoSub}>Método Billings · gratuito e seguro</p>
        </div>

        <div className={styles.body}>
          {enviado ? (
            <div className={styles.enviado}>
              <span style={{ fontSize: '3rem' }}>📬</span>
              <h2>Confirme seu e-mail</h2>
              <p>
                Enviamos um link de confirmação para <strong>{email}</strong>.
                Clique nele para ativar sua conta.
              </p>
              <a href="/auth/login" className={styles.linkBtn} style={{ marginTop: '0.75rem' }}>
                Ir para o login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSignup} className={styles.form}>

              <label className={styles.label}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required autoComplete="email"
                className={styles.input}
              />

              <label className={styles.label}>Senha</label>
              <div className={styles.senhaWrap}>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required minLength={6}
                  autoComplete="new-password" className={styles.input}
                />
                <button type="button" className={styles.senhaToggle}
                  onClick={() => setMostrarSenha(v => !v)} tabIndex={-1}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>

              <label className={styles.label}>Confirmar senha</label>
              <div className={styles.senhaWrap}>
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmar} onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a senha" required minLength={6}
                  autoComplete="new-password" className={styles.input}
                />
                <button type="button" className={styles.senhaToggle}
                  onClick={() => setMostrarConfirmar(v => !v)} tabIndex={-1}
                  aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Mostrar senha'}>
                  {mostrarConfirmar ? '🙈' : '👁️'}
                </button>
              </div>

              {erro && (
                <div className={styles.erroBox}>
                  <span className={styles.erroIcon}>⚠️</span>
                  <p className={styles.erroTexto}>{erro}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? 'Criando conta…' : 'Criar conta'}
              </button>

              <div className={styles.linksRow}>
                <span />
                <a href="/auth/login" className={styles.linkBtn}>Já tenho conta</a>
              </div>

            </form>
          )}

          <p className={styles.avisoDiscret}>
            ⚕️ Este app não substitui orientação de instrutora certificada ou ginecologista.
          </p>
        </div>

      </div>
    </main>
  )
}
