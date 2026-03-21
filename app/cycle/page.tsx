'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  getBrowserClient,
  classificarComContexto,
  COR_CLASS,
  LABEL_CLASS,
  type Registro,
  type Classificacao,
} from '@/lib/supabase'
import styles from './cycle.module.css'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// Ordem vertical no gráfico (de cima para baixo = mais fértil para menos)
const ORDEM_Y: Classificacao[] = ['pico','pos_pico','fertil','infertil','sangue','nenhum']
const Y_POS: Record<Classificacao, number> = {
  pico: 0, pos_pico: 1, fertil: 2, infertil: 3, sangue: 4, nenhum: 5,
}

function diasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate()
}

export default function CyclePage() {
  const supabase = getBrowserClient()
  const hoje = new Date()

  const [userId, setUserId] = useState<string | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [mesSel, setMesSel] = useState(hoje.getMonth())
  const [anoSel, setAnoSel] = useState(hoje.getFullYear())

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const carregar = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('registros').select('*')
      .eq('user_id', userId)
      .order('data', { ascending: true })
      .limit(90)
    if (data) setRegistros(data)
  }, [userId])

  useEffect(() => { carregar() }, [carregar])

  const registrosAsc = [...registros].sort((a,b) => a.data.localeCompare(b.data))

  // Dados do mês selecionado
  const total = diasNoMes(anoSel, mesSel)
  const diasMes = Array.from({ length: total }, (_, i) => {
    const dia = i + 1
    const iso = `${anoSel}-${String(mesSel+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    const info = classificarComContexto(registrosAsc, iso)
    const reg = registros.find(r => r.data === iso)
    return { dia, iso, info, reg }
  })

  // Resumo do mês
  const contagem = (['pico','pos_pico','fertil','infertil','sangue'] as Classificacao[]).map(c => ({
    cls: c,
    count: diasMes.filter(d => d.info.classificacao === c).length,
  }))
  const comRelacao = diasMes.filter(d => d.reg?.relacao).length
  const comAlerta  = diasMes.filter(d => d.info.alertaRelacao).length
  const registrados = diasMes.filter(d => d.info.classificacao !== 'nenhum').length

  // Navegação de mês (máx 3 meses atrás)
  const minDate = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
  const maxDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const podeVoltar  = new Date(anoSel, mesSel) > minDate
  const podeAvancar = new Date(anoSel, mesSel) < maxDate

  function navMes(delta: number) {
    let nm = mesSel + delta, na = anoSel
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMesSel(nm); setAnoSel(na)
  }

  // Dimensões SVG da linha do tempo
  const SVG_H = 160
  const SVG_PADDING_Y = 20
  const CELL_H = (SVG_H - SVG_PADDING_Y * 2) / (ORDEM_Y.length - 1)
  const DOT_R = 5

  function yPos(cls: Classificacao) {
    return SVG_PADDING_Y + Y_POS[cls] * CELL_H
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Gráfico do Ciclo</h1>
        <div style={{ width: '4rem' }} />
      </header>

      {/* Navegação de mês */}
      <div className={styles.navMes}>
        <button onClick={() => navMes(-1)} disabled={!podeVoltar} className={styles.navBtn}>‹</button>
        <span className={styles.mesLabel}>{MESES_FULL[mesSel]} {anoSel}</span>
        <button onClick={() => navMes(1)} disabled={!podeAvancar} className={styles.navBtn}>›</button>
      </div>

      {/* Legenda */}
      <div className={styles.legenda}>
        {(['pico','pos_pico','fertil','infertil','sangue'] as Classificacao[]).map(c => (
          <div key={c} className={styles.legendaItem}>
            <span className={styles.legendaDot} style={{ background: COR_CLASS[c] }} />
            <span>{LABEL_CLASS[c].replace(/🔴|🟠|🟡|🟢|🔵|⚪/g,'').trim()}</span>
          </div>
        ))}
      </div>

      {/* Gráfico linha do tempo */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Linha do ciclo — {MESES[mesSel]}</h2>

        {registrados === 0 ? (
          <p className={styles.mutedText}>Nenhum registro neste mês ainda.</p>
        ) : (
          <div className={styles.svgWrap}>
            <svg
              viewBox={`0 0 ${total * 14} ${SVG_H}`}
              preserveAspectRatio="none"
              className={styles.svg}
            >
              {/* Linhas de grade horizontais */}
              {ORDEM_Y.slice(0,-1).map(cls => (
                <line
                  key={cls}
                  x1={0} y1={yPos(cls)}
                  x2={total * 14} y2={yPos(cls)}
                  stroke="var(--border)" strokeWidth={0.5} strokeDasharray="3 3"
                />
              ))}

              {/* Linha de conexão entre dias registrados */}
              {diasMes.filter(d => d.info.classificacao !== 'nenhum').map((d, i, arr) => {
                if (i === 0) return null
                const prev = arr[i - 1]
                // Só liga dias consecutivos (sem gap > 3 dias)
                const gap = d.dia - prev.dia
                if (gap > 3) return null
                return (
                  <line
                    key={`l-${d.dia}`}
                    x1={(prev.dia - 0.5) * 14} y1={yPos(prev.info.classificacao)}
                    x2={(d.dia - 0.5) * 14}    y2={yPos(d.info.classificacao)}
                    stroke={COR_CLASS[d.info.classificacao]}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                  />
                )
              })}

              {/* Pontos */}
              {diasMes.map(({ dia, info, reg }) => {
                if (info.classificacao === 'nenhum') {
                  return (
                    <circle
                      key={dia}
                      cx={(dia - 0.5) * 14} cy={yPos('nenhum')}
                      r={2} fill="var(--border)"
                    />
                  )
                }
                return (
                  <g key={dia}>
                    <circle
                      cx={(dia - 0.5) * 14} cy={yPos(info.classificacao)}
                      r={DOT_R}
                      fill={COR_CLASS[info.classificacao]}
                      stroke="var(--card)" strokeWidth={1.5}
                    />
                    {/* Ícone de relação */}
                    {reg?.relacao && (
                      <text
                        x={(dia - 0.5) * 14} y={yPos(info.classificacao) - DOT_R - 2}
                        textAnchor="middle" fontSize={7} fill={info.alertaRelacao ? '#ef4444' : '#9ca3af'}
                      >
                        {info.alertaRelacao ? '⚠' : '•'}
                      </text>
                    )}
                    {/* Badge pós-pico */}
                    {info.diasAposPico > 0 && (
                      <text
                        x={(dia - 0.5) * 14} y={yPos(info.classificacao) + DOT_R + 8}
                        textAnchor="middle" fontSize={6} fill="#f97316" fontWeight="bold"
                      >
                        +{info.diasAposPico}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Números dos dias no eixo X */}
              {diasMes.filter(d => d.dia % 5 === 0 || d.dia === 1).map(({ dia }) => (
                <text
                  key={`x-${dia}`}
                  x={(dia - 0.5) * 14} y={SVG_H - 4}
                  textAnchor="middle" fontSize={7}
                  fill="var(--muted)"
                >
                  {dia}
                </text>
              ))}
            </svg>

            {/* Labels do eixo Y */}
            <div className={styles.yLabels}>
              {ORDEM_Y.slice(0,-1).map(cls => (
                <div
                  key={cls}
                  className={styles.yLabel}
                  style={{ color: COR_CLASS[cls] }}
                >
                  {LABEL_CLASS[cls].replace(/🔴|🟠|🟡|🟢|🔵|⚪/g,'').trim()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resumo do mês */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Resumo de {MESES_FULL[mesSel]}</h2>

        <div className={styles.resumoGrade}>
          {contagem.filter(c => c.count > 0).map(({ cls, count }) => (
            <div key={cls} className={styles.resumoItem}>
              <span className={styles.resumoDot} style={{ background: COR_CLASS[cls] }} />
              <span className={styles.resumoCount}>{count}</span>
              <span className={styles.resumoLabel}>
                {LABEL_CLASS[cls].replace(/🔴|🟠|🟡|🟢|🔵|⚪/g,'').trim()}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.resumoStats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{registrados}</span>
            <span className={styles.statLabel}>dias registrados</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{total - registrados}</span>
            <span className={styles.statLabel}>sem registro</span>
          </div>
          {comRelacao > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statNum}>💑 {comRelacao}</span>
              <span className={styles.statLabel}>com relação</span>
            </div>
          )}
          {comAlerta > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statNum} style={{ color: '#f59e0b' }}>⚠️ {comAlerta}</span>
              <span className={styles.statLabel}>relação fértil</span>
            </div>
          )}
        </div>

        {/* Barra de proporção fértil/infértil */}
        {registrados > 0 && (() => {
          const ferteis = diasMes.filter(d =>
            ['pico','pos_pico','fertil'].includes(d.info.classificacao)
          ).length
          const inferteis = diasMes.filter(d => d.info.classificacao === 'infertil').length
          const pctFertil   = Math.round((ferteis  / registrados) * 100)
          const pctInfertil = Math.round((inferteis / registrados) * 100)

          return (
            <div className={styles.barraFertil}>
              <div className={styles.barraLabel}>
                <span style={{ color: '#ef4444' }}>🔴 Fértil {pctFertil}%</span>
                <span style={{ color: '#22c55e' }}>Infértil {pctInfertil}% 🟢</span>
              </div>
              <div className={styles.barra}>
                <div className={styles.barraFertilFill} style={{ width: `${pctFertil}%` }} />
                <div className={styles.barraInfertilFill} style={{ width: `${pctInfertil}%` }} />
              </div>
            </div>
          )
        })()}
      </div>

      {/* Link para exportar */}
      <a
        href={`/api/export-pdf?ano=${anoSel}&mes=${mesSel}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.exportBtn}
      >
        📄 Exportar relatório de {MESES_FULL[mesSel]} em PDF
      </a>

    </main>
  )
}
