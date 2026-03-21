'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient, classificarDia, temAlertaRelacao, type Registro, type Classificacao } from '@/lib/supabase'
import styles from './calendar.module.css'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const COR: Record<Classificacao, string> = {
  pico: '#ef4444', fertil: '#eab308', infertil: '#22c55e',
  sangue: '#3b82f6', nenhum: 'transparent',
}
const LABEL: Record<Classificacao, string> = {
  pico: 'Pico 🔴', fertil: 'Fértil 🟡', infertil: 'Infértil 🟢',
  sangue: 'Sangramento 🔵', nenhum: 'Sem registro',
}

function diasNoMes(ano: number, mes: number) {
  return new Date(ano, mes + 1, 0).getDate()
}
function primeiroDiaSemana(ano: number, mes: number) {
  return new Date(ano, mes, 1).getDay()
}

export default function CalendarPage() {
  const router = useRouter()
  const supabase = getBrowserClient()
  const hoje = new Date()

  const [userId, setUserId] = useState<string | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [selecionado, setSelecionado] = useState<Registro | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  const carregar = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('registros').select('*')
      .eq('user_id', userId).order('data', { ascending: false }).limit(90)
    if (data) setRegistros(data)
  }, [userId])

  useEffect(() => { carregar() }, [carregar])

  function navMes(delta: number) {
    let nm = mes + delta
    let na = ano
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAno(na); setSelecionado(null)
  }

  // Limita navegação aos últimos 3 meses
  const minDate = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
  const maxDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const podeVoltar = new Date(ano, mes) > minDate
  const podeAvancar = new Date(ano, mes) < maxDate

  const total = diasNoMes(ano, mes)
  const offset = primeiroDiaSemana(ano, mes)

  function getRegistro(dia: number): Registro | undefined {
    const iso = `${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    return registros.find(r => r.data === iso)
  }

  function ehFuturo(dia: number) {
    const d = new Date(ano, mes, dia)
    d.setHours(23,59,59)
    return d > hoje
  }

  return (
    <main className={styles.main}>

      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Calendário</h1>
        <div style={{ width: '4rem' }} />
      </header>

      {/* Navegação de mês */}
      <div className={styles.navMes}>
        <button onClick={() => navMes(-1)} disabled={!podeVoltar} className={styles.navBtn}>‹</button>
        <span className={styles.mesLabel}>{MESES[mes]} {ano}</span>
        <button onClick={() => navMes(1)} disabled={!podeAvancar} className={styles.navBtn}>›</button>
      </div>

      {/* Legenda */}
      <div className={styles.legenda}>
        {(['infertil','fertil','pico','sangue'] as Classificacao[]).map(c => (
          <div key={c} className={styles.legendaItem}>
            <span className={styles.legendaDot} style={{ background: COR[c] }} />
            <span>{LABEL[c].split(' ')[0]}</span>
          </div>
        ))}
        <div className={styles.legendaItem}>
          <span className={styles.legendaDot} style={{ background: 'transparent', border: '1.5px solid #9ca3af' }} />
          <span>Sem dado</span>
        </div>
      </div>

      {/* Grade do calendário */}
      <div className={styles.card}>
        {/* Cabeçalho semana */}
        <div className={styles.grade}>
          {DIAS_SEMANA.map(d => (
            <div key={d} className={styles.diaSemana}>{d}</div>
          ))}

          {/* Espaços vazios antes do 1º dia */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: total }).map((_, i) => {
            const dia = i + 1
            const reg = getRegistro(dia)
            const cls = classificarDia(reg ?? null)
            const alerta = reg ? temAlertaRelacao(reg) : false
            const futuro = ehFuturo(dia)
            const isHoje = ano === hoje.getFullYear() && mes === hoje.getMonth() && dia === hoje.getDate()
            const isSel = selecionado && reg && selecionado.id === reg?.id

            return (
              <button
                key={dia}
                className={`${styles.dia} ${isHoje ? styles.diaHoje : ''} ${isSel ? styles.diaSelecionado : ''} ${futuro ? styles.diaFuturo : ''}`}
                onClick={() => !futuro && setSelecionado(reg === selecionado ? null : (reg ?? null))}
                disabled={futuro}
              >
                <span className={styles.diaNum}>{dia}</span>
                {!futuro && (
                  <span
                    className={styles.diaDot}
                    style={{
                      background: cls !== 'nenhum' ? COR[cls] : 'transparent',
                      border: cls === 'nenhum' ? '1.5px solid #d1d5db' : 'none',
                    }}
                  />
                )}
                {alerta && <span className={styles.diaAlerta}>⚠</span>}
                {reg?.relacao && !alerta && <span className={styles.diaRelacao}>•</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Painel de detalhe do dia selecionado */}
      {selecionado && (
        <div className={styles.detalhe}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 className={styles.detalheTitle}>
              {selecionado.data.split('-').reverse().join('/')}
            </h3>
            <button onClick={() => setSelecionado(null)} className={styles.fecharBtn}>✕</button>
          </div>

          <div className={styles.detalheGrade}>
            <Item label="Classificação" valor={LABEL[classificarDia(selecionado)]}
              cor={COR[classificarDia(selecionado)]} />
            <Item label="Muco" valor={selecionado.muco ?? '—'} />
            <Item label="Sensação" valor={selecionado.sensacao ?? '—'} />
            <Item label="Sangramento" valor={selecionado.sangramento ?? '—'} />
            <Item label="Relação" valor={selecionado.relacao ? 'Sim' : 'Não'}
              cor={selecionado.relacao ? undefined : undefined} />
          </div>

          {temAlertaRelacao(selecionado) && (
            <div className={styles.detalheAlerta}>
              ⚠️ Relação em dia <strong>{LABEL[classificarDia(selecionado)]}</strong> —
              consulte sua instrutora para orientação.
            </div>
          )}

          {selecionado.observacoes && (
            <p className={styles.detalheObs}>📝 {selecionado.observacoes}</p>
          )}

          <Link
            href="/"
            onClick={() => {/* passa a data via state não é possível sem query */}}
            className={styles.detalheEditBtn}
          >
            Editar este registro →
          </Link>
        </div>
      )}

      {/* Resumo do mês */}
      <div className={styles.card} style={{ marginTop: '1rem' }}>
        <h3 className={styles.cardTitle}>Resumo de {MESES[mes]}</h3>
        <div className={styles.resumoGrade}>
          {(['infertil','fertil','pico','sangue'] as Classificacao[]).map(c => {
            const count = Array.from({ length: total }).filter((_, i) => {
              const r = getRegistro(i + 1)
              return r && classificarDia(r) === c
            }).length
            return (
              <div key={c} className={styles.resumoItem}>
                <span className={styles.resumoDot} style={{ background: COR[c] }} />
                <span className={styles.resumoCount}>{count}</span>
                <span className={styles.resumoLabel}>{LABEL[c].split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
        {(() => {
          const comRelacao = Array.from({ length: total }).filter((_, i) => {
            const r = getRegistro(i + 1)
            return r?.relacao
          }).length
          const comAlerta = Array.from({ length: total }).filter((_, i) => {
            const r = getRegistro(i + 1)
            return r && temAlertaRelacao(r)
          }).length
          return comRelacao > 0 ? (
            <p className={styles.resumoRelacao}>
              💑 {comRelacao} dia{comRelacao > 1 ? 's' : ''} com relação
              {comAlerta > 0 && <span className={styles.resumoAlertaBadge}> · ⚠️ {comAlerta} em dia fértil/pico</span>}
            </p>
          ) : null
        })()}
      </div>

    </main>
  )
}

function Item({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <div className={styles.detalheItem}>
      <span className={styles.detalheLabel}>{label}</span>
      <span className={styles.detalheValor} style={cor ? { color: cor, fontWeight: 700 } : {}}>
        {valor}
      </span>
    </div>
  )
}
