'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'
import styles from './changelog.module.css'

type Entrada = {
  id: string
  versao: string
  titulo: string
  descricao: string
  tipo: 'novo' | 'melhoria' | 'correcao'
  data: string
}

const TIPO_CONFIG = {
  novo:      { emoji: '✨', label: 'Novidade',  cor: '#7c3aed' },
  melhoria:  { emoji: '⚡', label: 'Melhoria',  cor: '#2563eb' },
  correcao:  { emoji: '🐛', label: 'Correção',  cor: '#16a34a' },
}

export default function ChangelogPage() {
  const supabase = getBrowserClient()
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('changelog')
        .select('*')
        .order('data', { ascending: false })
        .limit(50)
      if (data) setEntradas(data)
      setLoading(false)

      // Marca que viu as novidades
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mob-changelog-visto', data?.[0]?.versao ?? '')
      }
    }
    carregar()
  }, [])

  // Agrupa por versão
  const porVersao = entradas.reduce<Record<string, Entrada[]>>((acc, e) => {
    if (!acc[e.versao]) acc[e.versao] = []
    acc[e.versao].push(e)
    return acc
  }, {})

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Novidades</h1>
        <div style={{ width: '4rem' }} />
      </header>

      {loading ? (
        <div className={styles.loading}>Carregando novidades…</div>
      ) : entradas.length === 0 ? (
        <div className={styles.vazio}>
          <span style={{ fontSize: '3rem' }}>📋</span>
          <p>Nenhuma novidade por enquanto.<br/>Fique de olho nas próximas atualizações!</p>
        </div>
      ) : (
        Object.entries(porVersao).map(([versao, items]) => (
          <div key={versao} className={styles.versaoBloco}>
            <div className={styles.versaoHeader}>
              <span className={styles.versaoTag}>v{versao}</span>
              <span className={styles.versaoData}>
                {new Date(items[0].data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className={styles.card}>
              {items.map((item, idx) => {
                const cfg = TIPO_CONFIG[item.tipo]
                return (
                  <div key={item.id} className={`${styles.item} ${idx < items.length - 1 ? styles.itemBorder : ''}`}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemEmoji}>{cfg.emoji}</span>
                      <span className={styles.itemBadge} style={{ background: cfg.cor + '18', color: cfg.cor }}>
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className={styles.itemTitulo}>{item.titulo}</h3>
                    <p className={styles.itemDesc}>{item.descricao}</p>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </main>
  )
}
