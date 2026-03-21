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
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [pronto, setPronto] = useState(false)
  const [sessaoOk, setSessaoOk] = useState(false)

  // O Supabase seta a sessão via fragment (#access_token=...) quando o usuário
  // clica no link. Precisamos detectar isso antes de mostrar o formulário.
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
    if (senha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      setErro(error.message)
    } else {
      setPronto(true)
      setTimeout(() => router.push('/'), 2500)
    }
    setLoading(false)
  }

  if (!sessaoOk) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⏳</span>
            <h1 className={styles.logoTitle}>Verificando link…</h1>
            <p className={styles.logoSub}>Aguarde um momento</p>
          </div>
          <p className={styles.hint}>
            Se esta página não avançar, o link pode ter expirado.{' '}
            <a href="/auth/forgot" className={styles.linkBtn}>Solicitar novo link</a>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔒</span>
          <h1 className={styles.logoTitle}>Nova senha</h1>
          <p className={styles.logoSub}>Escolha uma senha segura</p>
        </div>

        {pronto ? (
          <div className={styles.sucesso}>
            <span style={{ fontSize: '2.5rem' }}>✅</span>
            <p>Senha atualizada! Redirecionando…</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className={styles.form}>
            <label className={styles.label}>Nova senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres" required minLength={6} className={styles.input} />

            <label className={styles.label}>Confirmar nova senha</label>
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Repita a senha" required minLength={6} className={styles.input} />

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        )}

      </div>
    </main>
  )
}
