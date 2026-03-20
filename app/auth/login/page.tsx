'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'var(--card)',
        borderRadius: '1.25rem',
        padding: '2rem',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Logo / título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌿</div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--violet)' }}>
            Método Billings
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>
            Registro diário do muco cervical
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', color: 'var(--fg)' }}>
              Link enviado!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Verifique sua caixa de entrada em <strong>{email}</strong> e clique no link para entrar.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              style={{
                marginTop: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--violet)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline',
              }}
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--fg)',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '1rem',
              }}
            />

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.813rem', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'var(--violet)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Enviando…' : 'Enviar Magic Link'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', marginTop: '1.25rem', lineHeight: 1.5 }}>
              Você receberá um link por e-mail para entrar sem precisar de senha.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
