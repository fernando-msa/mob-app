'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import styles from './login.module.css'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error)
      } else {
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar a conta.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError('E-mail ou senha incorretos.')
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>🌸</div>
        <h1 className={styles.title}>Método Billings</h1>
        <p className={styles.subtitle}>{isSignUp ? 'Criar conta' : 'Entrar na sua conta'}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="seu@email.com"
              required
            />
          </label>

          <label className={styles.label}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {successMsg && <p className={styles.success}>{successMsg}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <button
          className={styles.toggle}
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg('') }}
        >
          {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
        </button>
      </div>
    </main>
  )
}
