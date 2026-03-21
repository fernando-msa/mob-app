'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase'
import { TEMAS, aplicarTema, salvarTemaLocal, type Tema } from '@/lib/profile'
import styles from './onboarding.module.css'

const STEPS = ['bemvinda', 'nome', 'tema', 'pronto'] as const
type Step = typeof STEPS[number]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = getBrowserClient()

  const [step, setStep] = useState<Step>('bemvinda')
  const [nome, setNome] = useState('')
  const [tema, setTema] = useState<Tema>('violeta')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  // Preview do tema em tempo real
  useEffect(() => {
    aplicarTema(tema)
    salvarTemaLocal(tema)
  }, [tema])

  async function salvar() {
    if (!userId || !nome.trim()) return
    setLoading(true)
    await supabase.from('profiles').upsert({
      user_id: userId,
      nome: nome.trim(),
      tema,
      onboarding_completo: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    setLoading(false)
    setStep('pronto')
  }

  function avancar() {
    const idx = STEPS.indexOf(step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>

        {/* Bem-vinda */}
        {step === 'bemvinda' && (
          <div className={styles.stepCentro}>
            <div className={styles.heroEmoji}>🌿</div>
            <h1 className={styles.heroTitle}>Bem-vinda ao<br/>Método Billings</h1>
            <p className={styles.heroSub}>
              Vamos deixar o app com a sua cara antes de começar.
              Vai levar menos de 1 minuto!
            </p>
            <button onClick={avancar} className={styles.btnPrimary}>
              Vamos começar →
            </button>
          </div>
        )}

        {/* Nome */}
        {step === 'nome' && (
          <div className={styles.stepCentro}>
            <div className={styles.heroEmoji}>👋</div>
            <h2 className={styles.stepTitle}>Como podemos te chamar?</h2>
            <p className={styles.stepSub}>Pode ser seu nome, apelido — como preferir.</p>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome…"
              maxLength={40}
              autoFocus
              className={styles.input}
              onKeyDown={e => e.key === 'Enter' && nome.trim() && avancar()}
            />
            <button
              onClick={avancar}
              disabled={!nome.trim()}
              className={styles.btnPrimary}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Tema */}
        {step === 'tema' && (
          <div className={styles.stepCentro}>
            <div className={styles.heroEmoji}>🎨</div>
            <h2 className={styles.stepTitle}>Qual cor combina com você?</h2>
            <p className={styles.stepSub}>
              Olá, <strong>{nome}</strong>! Escolha um tema para o app.
            </p>
            <div className={styles.temaGrade}>
              {TEMAS.map(t => (
                <button
                  key={t.valor}
                  onClick={() => setTema(t.valor)}
                  className={`${styles.temaBtn} ${tema === t.valor ? styles.temaBtnAtivo : ''}`}
                  style={{
                    borderColor: tema === t.valor ? t.cor : 'transparent',
                    background: tema === t.valor ? t.cor + '18' : 'var(--bg)',
                  }}
                >
                  <span className={styles.temaCircle} style={{ background: t.cor }} />
                  <span className={styles.temaLabel}>{t.emoji} {t.label}</span>
                </button>
              ))}
            </div>
            <button onClick={salvar} disabled={loading} className={styles.btnPrimary}>
              {loading ? 'Salvando…' : 'Salvar preferências →'}
            </button>
          </div>
        )}

        {/* Pronto */}
        {step === 'pronto' && (
          <div className={styles.stepCentro}>
            <div className={styles.heroEmoji}>✨</div>
            <h2 className={styles.stepTitle}>Tudo pronto, {nome}!</h2>
            <p className={styles.stepSub}>
              Seu perfil está configurado. Você pode alterar suas preferências
              a qualquer momento no menu de perfil.
            </p>
            <div className={styles.temaPrev} style={{ background: 'var(--accent)' }}>
              <span>🌿 Método Billings</span>
              <span style={{ opacity: 0.8, fontSize: '0.813rem' }}>Tema: {TEMAS.find(t => t.valor === tema)?.label}</span>
            </div>
            <button onClick={() => router.push('/')} className={styles.btnPrimary}>
              Ir para o app →
            </button>
          </div>
        )}

        {/* Indicador de progresso */}
        {step !== 'pronto' && (
          <div className={styles.progresso}>
            {STEPS.slice(0, -1).map((s, i) => (
              <div
                key={s}
                className={`${styles.progressoDot} ${STEPS.indexOf(step) >= i ? styles.progressoDotAtivo : ''}`}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
