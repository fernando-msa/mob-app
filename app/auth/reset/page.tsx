'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function ResetPage() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [pronto, setPronto] = useState(false)
  const [sessaoOk, setSessaoOk] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessaoOk(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) setSessaoOk(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) { setErro('As senhas não coincidem.'); return }
    if (senha.length < 6)    { setErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) setErro(error.message)
    else { setPronto(true); setTimeout(() => router.push('/'), 2500) }
    setLoading(false)
  }

  if (!sessaoOk) return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logoIcon}>⏳</span>
          <h1 className={styles.logoTitle}>Verificando link…</h1>
          <p className={styles.logoSub}>Aguarde um momento</p>
        </div>
        <div className={styles.body}>
          <p className={styles.hint}>
            Se a página não avançar, o link pode ter expirado.{' '}
            <a href="/auth/forgot" className={styles.linkBtn}>Solicitar novo link</a>
          </p>
        </div>
      </div>
    </main>
  )

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.header}>
          <span className={styles.logoIcon}>🔒</span>
          <h1 className={styles.logoTitle}>Nova senha</h1>
          <p className={styles.logoSub}>Escolha uma senha segura para sua conta</p>
        </div>

        <div className={styles.body}>
          {pronto ? (
            <div className={styles.enviado}>
              <span style={{ fontSize: '3rem' }}>✅</span>
              <h2>Senha atualizada!</h2>
              <p>Redirecionando para o app…</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className={styles.form}>

              <label className={styles.label}>Nova senha</label>
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

              <label className={styles.label}>Confirmar nova senha</label>
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
                {loading ? 'Salvando…' : 'Salvar nova senha'}
              </button>

            </form>
          )}
        </div>

      </div>
    </main>
  )
}
