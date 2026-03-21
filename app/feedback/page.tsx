'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'
import styles from './feedback.module.css'

type Tipo = 'bug' | 'melhoria' | 'elogio' | 'outro'

const TIPOS: { valor: Tipo; emoji: string; label: string }[] = [
  { valor: 'bug',     emoji: '🐛', label: 'Erro / Bug' },
  { valor: 'melhoria',emoji: '💡', label: 'Sugestão' },
  { valor: 'elogio',  emoji: '❤️', label: 'Elogio' },
  { valor: 'outro',   emoji: '💬', label: 'Outro' },
]

export default function FeedbackPage() {
  const supabase = getBrowserClient()

  const [tipo, setTipo] = useState<Tipo>('melhoria')
  const [mensagem, setMensagem] = useState('')
  const [contato, setContato] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!mensagem.trim()) return
    setLoading(true); setErro('')

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('feedbacks').insert({
      user_id: user?.id ?? null,
      tipo,
      mensagem: mensagem.trim(),
      contato: contato.trim() || null,
    })

    if (error) setErro('Erro ao enviar. Tente novamente.')
    else setEnviado(true)
    setLoading(false)
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Feedback</h1>
        <div style={{ width: '4rem' }} />
      </header>

      {enviado ? (
        <div className={styles.sucesso}>
          <span style={{ fontSize: '3.5rem' }}>💜</span>
          <h2>Obrigada pelo feedback!</h2>
          <p>Sua mensagem foi recebida e vai nos ajudar a melhorar o app.</p>
          <Link href="/" className={styles.btnPrimary} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Voltar ao app
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.intro}>
            <p>Encontrou um erro? Tem uma sugestão? Adoramos ouvir você! 💬</p>
          </div>

          <form onSubmit={enviar} className={styles.card}>
            <label className={styles.label}>Tipo de feedback</label>
            <div className={styles.tipoGrade}>
              {TIPOS.map(t => (
                <button key={t.valor} type="button"
                  onClick={() => setTipo(t.valor)}
                  className={`${styles.tipoBtn} ${tipo === t.valor ? styles.tipoBtnAtivo : ''}`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <label className={styles.label}>Sua mensagem</label>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder={
                tipo === 'bug' ? 'Descreva o erro: o que aconteceu e quando…' :
                tipo === 'melhoria' ? 'Qual melhoria você sugere? Como funcionaria?' :
                tipo === 'elogio' ? 'O que você gostou no app?' :
                'Escreva sua mensagem…'
              }
              rows={5}
              required
              maxLength={1000}
              className={styles.textarea}
            />
            <span className={styles.contador}>{mensagem.length}/1000</span>

            <label className={styles.label}>Contato (opcional)</label>
            <input type="email" value={contato} onChange={e => setContato(e.target.value)}
              placeholder="seu@email.com — para te respondermos"
              className={styles.input} />

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" disabled={loading || !mensagem.trim()} className={styles.btnPrimary}>
              {loading ? 'Enviando…' : 'Enviar feedback'}
            </button>
          </form>
        </>
      )}
    </main>
  )
}
