'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, classificarDia, type Registro, type Classificacao } from '@/lib/supabase'
import styles from './page.module.css'

const PT_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const PT_DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const PT_DIA_LONGO = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']

const MUCO_OPTS = [
  { val: 'seco', label: 'Seco' },
  { val: 'nada', label: 'Nada percebido' },
  { val: 'espesso', label: 'Espesso / pastoso' },
  { val: 'cremoso', label: 'Cremoso / branco' },
  { val: 'elastico', label: 'Elástico / transparente' },
  { val: 'filante', label: 'Filante (clara de ovo)' },
]
const SENS_OPTS = [
  { val: 'seca', label: 'Seca' },
  { val: 'umida', label: 'Úmida' },
  { val: 'molhada', label: 'Molhada' },
  { val: 'escorregadia', label: 'Escorregadia' },
  { val: 'lubricada', label: 'Lubrificada' },
]
const SANG_OPTS = [
  { val: 'nenhum', label: 'Nenhum' },
  { val: 'leve', label: 'Leve (mancha)' },
  { val: 'moderado', label: 'Moderado' },
  { val: 'intenso', label: 'Intenso' },
]

function toDateKey(d: Date) {
  return d.toISOString().split('T')[0]
}

function classLabel(cls: Classificacao) {
  if (cls === 'infertil') return { text: 'Fase infértil', color: 'teal' }
  if (cls === 'fertil') return { text: 'Fase fértil', color: 'coral' }
  if (cls === 'pico') return { text: 'Dia Pico / alta fertilidade', color: 'plum' }
  if (cls === 'sangue') return { text: 'Menstruação / manchas', color: 'rose' }
  return { text: 'Sem registro', color: 'muted' }
}

function interpDesc(cls: Classificacao) {
  if (cls === 'sangue') return 'Durante a menstruação, o método considera um período de incerteza. Recomenda-se abstinência, pois o sangramento pode mascarar o muco cervical. Manchas pré-menstruais também pedem cautela.'
  if (cls === 'pico') return 'O muco elástico, filante ou a sensação escorregadia/lubrificada indica o período de máxima fertilidade. O dia pico é o último dia deste tipo de muco — confirmado retrospectivamente. Recomenda-se abstinência neste dia e nos 3 dias seguintes.'
  if (cls === 'fertil') return 'O muco cremoso, pastoso ou a sensação úmida/molhada indica que a fertilidade está aumentando. Qualquer aparecimento de muco sinaliza início da fase fértil. Recomenda-se abstinência ou avaliação cuidadosa com a instrutora.'
  if (cls === 'infertil') return 'A ausência de muco (sensação seca) indica um dia provavelmente infértil. Pela Regra do Dia Seco, as relações são permitidas à noite. No dia seguinte, se ainda houver secura, é novamente permitido à noite.'
  return 'Registre o muco e/ou a sensação vulvar para obter a interpretação do dia.'
}

export default function Home() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [tab, setTab] = useState<'registrar' | 'interpretacao' | 'calendario' | 'regras'>('registrar')
  const [currentDate, setCurrentDate] = useState(today)
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [records, setRecords] = useState<Record<string, Registro>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [loading, setLoading] = useState(true)

  // form state
  const [muco, setMuco] = useState<string | null>(null)
  const [sensacao, setSensacao] = useState<string | null>(null)
  const [sangramento, setSangramento] = useState('nenhum')
  const [observacoes, setObservacoes] = useState('')

  const loadRecords = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('registros').select('*')
    if (!error && data) {
      const map: Record<string, Registro> = {}
      data.forEach((r: Registro) => { map[r.data] = r })
      setRecords(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadRecords() }, [loadRecords])

  useEffect(() => {
    const key = toDateKey(currentDate)
    const r = records[key]
    setMuco(r?.muco ?? null)
    setSensacao(r?.sensacao ?? null)
    setSangramento(r?.sangramento ?? 'nenhum')
    setObservacoes(r?.observacoes ?? '')
    setSaveMsg('')
  }, [currentDate, records])

  const changeDay = (delta: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + delta)
    setCurrentDate(d)
  }

  const saveDay = async () => {
    setSaving(true)
    const key = toDateKey(currentDate)
    const payload: Registro = { data: key, muco, sensacao, sangramento, observacoes }
    const existing = records[key]
    let error
    if (existing?.id) {
      ;({ error } = await supabase.from('registros').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', existing.id))
    } else {
      ;({ error } = await supabase.from('registros').insert(payload))
    }
    if (!error) {
      setSaveMsg('Salvo!')
      await loadRecords()
      setTimeout(() => setSaveMsg(''), 2500)
    } else {
      setSaveMsg('Erro ao salvar. Tente novamente.')
    }
    setSaving(false)
  }

  const changeCalMonth = (delta: number) => {
    let m = calMonth + delta
    let y = calYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setCalMonth(m); setCalYear(y)
  }

  const dayLabel = `${PT_DIA_LONGO[currentDate.getDay()]}, ${currentDate.getDate()} de ${PT_MESES[currentDate.getMonth()]}`
  const curKey = toDateKey(currentDate)
  const curRecord = records[curKey] || null
  const cls = classificarDia(muco !== null || sensacao !== null ? { data: curKey, muco, sensacao, sangramento, observacoes } : curRecord)
  const { text: clsText, color: clsColor } = classLabel(cls)

  // Calendar render data
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const prevDays = new Date(calYear, calMonth, 0).getDate()
  const calDays: { num: number; thisMonth: boolean; date: Date }[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(calYear, calMonth - 1, prevDays - i)
    calDays.push({ num: prevDays - i, thisMonth: false, date: d })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calDays.push({ num: d, thisMonth: true, date: new Date(calYear, calMonth, d) })
  }
  const remaining = 42 - calDays.length
  for (let d = 1; d <= remaining; d++) {
    calDays.push({ num: d, thisMonth: false, date: new Date(calYear, calMonth + 1, d) })
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Método Billings</h1>
        <p className={styles.subtitle}>Diário do ciclo</p>
      </header>

      <nav className={styles.tabs}>
        {(['registrar','interpretacao','calendario','regras'] as const).map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'registrar' ? 'Registrar' : t === 'interpretacao' ? 'Interpretação' : t === 'calendario' ? 'Calendário' : 'Regras'}
          </button>
        ))}
      </nav>

      {loading && <div className={styles.loading}>Carregando registros...</div>}

      {/* REGISTRAR */}
      {tab === 'registrar' && !loading && (
        <div className={styles.section}>
          <div className={styles.dayNav}>
            <button className={styles.navBtn} onClick={() => changeDay(-1)}>←</button>
            <span className={styles.dayLabel}>{dayLabel}</span>
            <button className={styles.navBtn} onClick={() => changeDay(1)}>→</button>
          </div>

          <div className={styles.card}>
            <div className={styles.fieldLabel}>Tipo de muco</div>
            <div className={styles.pills}>
              {MUCO_OPTS.map(o => (
                <button key={o.val} className={`${styles.pill} ${muco === o.val ? styles.pillActive : ''}`} onClick={() => setMuco(muco === o.val ? null : o.val)}>{o.label}</button>
              ))}
            </div>

            <div className={styles.fieldLabel} style={{ marginTop: '1.25rem' }}>Sensação na vulva</div>
            <div className={styles.pills}>
              {SENS_OPTS.map(o => (
                <button key={o.val} className={`${styles.pill} ${sensacao === o.val ? styles.pillSens : ''}`} onClick={() => setSensacao(sensacao === o.val ? null : o.val)}>{o.label}</button>
              ))}
            </div>

            <div className={styles.fieldLabel} style={{ marginTop: '1.25rem' }}>Sangramento</div>
            <div className={styles.pills}>
              {SANG_OPTS.map(o => (
                <button key={o.val} className={`${styles.pill} ${sangramento === o.val ? styles.pillSang : ''}`} onClick={() => setSangramento(o.val)}>{o.label}</button>
              ))}
            </div>

            <div className={styles.fieldLabel} style={{ marginTop: '1.25rem' }}>Observações</div>
            <textarea className={styles.textarea} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Desconforto, dor, outros sintomas..." rows={3} />

            <button className={styles.saveBtn} onClick={saveDay} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar registro'}
            </button>
            {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
          </div>
        </div>
      )}

      {/* INTERPRETAÇÃO */}
      {tab === 'interpretacao' && !loading && (
        <div className={styles.section}>
          <div className={styles.dayNav}>
            <button className={styles.navBtn} onClick={() => changeDay(-1)}>←</button>
            <span className={styles.dayLabel}>{dayLabel}</span>
            <button className={styles.navBtn} onClick={() => changeDay(1)}>→</button>
          </div>

          <div className={styles.card}>
            <span className={`${styles.badge} ${styles['badge_' + clsColor]}`}>{clsText}</span>
            <p className={styles.interpDesc}>{interpDesc(cls)}</p>

            {curRecord && (
              <div className={styles.recordSummary}>
                {curRecord.muco && <div><span className={styles.recLabel}>Muco:</span> {MUCO_OPTS.find(o => o.val === curRecord.muco)?.label ?? curRecord.muco}</div>}
                {curRecord.sensacao && <div><span className={styles.recLabel}>Sensação:</span> {SENS_OPTS.find(o => o.val === curRecord.sensacao)?.label ?? curRecord.sensacao}</div>}
                {curRecord.sangramento && curRecord.sangramento !== 'nenhum' && <div><span className={styles.recLabel}>Sangramento:</span> {SANG_OPTS.find(o => o.val === curRecord.sangramento)?.label ?? curRecord.sangramento}</div>}
                {curRecord.observacoes && <div><span className={styles.recLabel}>Obs:</span> <em>{curRecord.observacoes}</em></div>}
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles.cardNote}`}>
            <p>Este app é um auxiliar de registro. Para interpretação segura e personalizada, consulte sempre uma instrutora certificada do Método Billings.</p>
          </div>
        </div>
      )}

      {/* CALENDÁRIO */}
      {tab === 'calendario' && !loading && (
        <div className={styles.section}>
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={() => changeCalMonth(-1)}>←</button>
            <span className={styles.calMonth}>{PT_MESES[calMonth]} {calYear}</span>
            <button className={styles.navBtn} onClick={() => changeCalMonth(1)}>→</button>
          </div>

          <div className={styles.calGrid}>
            {PT_DIAS_SEMANA.map(d => <div key={d} className={styles.calDayName}>{d}</div>)}
            {calDays.map((cd, i) => {
              const key = toDateKey(cd.date)
              const r = records[key] ?? null
              const c = classificarDia(r)
              const isToday = cd.date.getTime() === today.getTime()
              const isSelected = cd.date.getTime() === currentDate.getTime()
              return (
                <div
                  key={i}
                  className={`${styles.calDay} ${!cd.thisMonth ? styles.calOtherMonth : ''} ${isToday ? styles.calToday : ''} ${isSelected ? styles.calSelected : ''}`}
                  onClick={() => { setCurrentDate(cd.date); setTab('registrar') }}
                >
                  <span className={styles.calNum}>{cd.num}</span>
                  {c !== 'nenhum' && <span className={`${styles.calDot} ${styles['dot_' + c]}`} />}
                </div>
              )
            })}
          </div>

          <div className={styles.legend}>
            <div className={styles.legItem}><span className={`${styles.legDot} ${styles.dot_infertil}`} />Infértil</div>
            <div className={styles.legItem}><span className={`${styles.legDot} ${styles.dot_fertil}`} />Fértil</div>
            <div className={styles.legItem}><span className={`${styles.legDot} ${styles.dot_pico}`} />Pico</div>
            <div className={styles.legItem}><span className={`${styles.legDot} ${styles.dot_sangue}`} />Sangramento</div>
          </div>
        </div>
      )}

      {/* REGRAS */}
      {tab === 'regras' && (
        <div className={styles.section}>
          {[
            { t: 'Regra do Dia Seco', d: 'Nos dias sem muco (sensação seca), as relações são permitidas à noite. No dia seguinte, se ainda houver secura, é novamente permitido à noite.' },
            { t: 'Dia Pico', d: 'Último dia de muco filante, transparente, escorregadio ou com sensação lubrificada. É o sinal mais próximo da ovulação. Identificado retrospectivamente — no dia seguinte, quando o muco muda ou desaparece.' },
            { t: 'Regra do Pico', d: 'No dia pico e nos 3 dias seguintes, recomenda-se abstinência. A partir do 4º dia seco após o pico até o fim do ciclo, o período é infértil.' },
            { t: 'Início do ciclo (menstruação)', d: 'Durante a menstruação, há incerteza. Recomenda-se abstinência, pois o sangramento pode mascarar o muco.' },
            { t: 'Manchas pré-menstruais', d: 'Manchas de sangue antes da menstruação são tratadas como dias férteis pelo método.' },
            { t: 'Muco em evolução (fase fértil)', d: 'Qualquer aparecimento de muco, mesmo espesso, sinaliza início da fase fértil. Quanto mais elástico e transparente, mais próxima está a ovulação.' },
          ].map(r => (
            <div key={r.t} className={styles.ruleCard}>
              <strong>{r.t}</strong>
              <p>{r.d}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
