import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const LABEL: Record<string,string> = { pico:'Pico', fertil:'Fértil', infertil:'Infértil', sangue:'Sangramento', nenhum:'Sem registro' }
const COR:   Record<string,string> = { pico:'#ef4444', fertil:'#eab308', infertil:'#16a34a', sangue:'#3b82f6', nenhum:'#9ca3af' }

function classificar(r: any): string {
  if (!r) return 'nenhum'
  if (r.sangramento && r.sangramento !== 'nenhum') return 'sangue'
  const m = r.muco; const s = r.sensacao
  if (m==='filante'||s==='escorregadia'||s==='lubricada') return 'pico'
  if (m==='elastico'||m==='cremoso'||s==='molhada'||s==='umida') return 'fertil'
  if (m==='seco'||m==='nada'||s==='seca') return 'infertil'
  return 'nenhum'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ano = parseInt(searchParams.get('ano') ?? String(new Date().getFullYear()))
  const mes = parseInt(searchParams.get('mes') ?? String(new Date().getMonth()))

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('nome').eq('user_id', user.id).single()
  const nome = profile?.nome ?? 'Usuária'
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const dataInicio = `${ano}-${String(mes+1).padStart(2,'0')}-01`
  const dataFim    = `${ano}-${String(mes+1).padStart(2,'0')}-${String(diasNoMes).padStart(2,'0')}`
  const { data: registros } = await supabase.from('registros').select('*')
    .eq('user_id', user.id).gte('data', dataInicio).lte('data', dataFim).order('data', { ascending: true })

  const linhas = Array.from({ length: diasNoMes }, (_, i) => {
    const dia = i + 1
    const iso = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
    const r = registros?.find(x => x.data === iso)
    const cls = classificar(r); const cor = COR[cls]
    const alertaRel = r?.relacao && (cls === 'fertil' || cls === 'pico')
    return `
      <tr>
        <td style="text-align:center;font-weight:700;color:#374151;padding:8px 6px;white-space:nowrap;">${dia}</td>
        <td style="padding:8px 6px;">
          <span style="display:inline-block;background:${cor}22;color:${cor};font-size:11px;font-weight:700;padding:3px 8px;border-radius:20px;">${LABEL[cls]}</span>
        </td>
        <td style="padding:8px 6px;font-size:12px;color:#374151;text-transform:capitalize;">${r?.muco ?? '—'}</td>
        <td style="padding:8px 6px;font-size:12px;color:#374151;text-transform:capitalize;">${r?.sensacao ?? '—'}</td>
        <td style="padding:8px 6px;font-size:12px;text-align:center;">${r?.relacao ? '<span style="color:#7c3aed;font-weight:700;">Sim</span>' : '—'}</td>
        <td style="padding:8px 6px;font-size:12px;color:#6b7280;">${r?.observacoes || (alertaRel ? '⚠️ Relação em dia fértil/pico' : '—')}</td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Relatório ${MESES[mes]} ${ano}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;}
.top{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:24px 32px;}
.top h1{font-size:20px;font-weight:800;margin-bottom:4px;}
.top p{font-size:12px;opacity:.85;}
.aviso{background:#faf5ff;border-left:4px solid #7c3aed;padding:10px 16px;margin:16px 32px;font-size:12px;color:#5b21b6;border-radius:0 6px 6px 0;line-height:1.5;}
table{width:calc(100% - 64px);margin:12px 32px 24px;border-collapse:collapse;}
thead tr{background:#f3f4f6;}
th{padding:9px 6px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #e5e7eb;}
tbody tr:nth-child(even){background:#fafafa;}
td{border-bottom:1px solid #f3f4f6;vertical-align:middle;}
.foot{margin:0 32px;font-size:11px;color:#9ca3af;padding-top:12px;border-top:1px solid #e5e7eb;line-height:1.6;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body>
<div class="top">
  <h1>🌿 Método de Ovulação Billings</h1>
  <p>Relatório de ${MESES[mes]} ${ano} &nbsp;·&nbsp; ${nome} &nbsp;·&nbsp; Gerado em ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p>
</div>
<div class="aviso">⚕️ <strong>Aviso:</strong> Este relatório é um auxiliar de registro. Para interpretação do ciclo, consulte uma instrutora certificada do MOB ou seu ginecologista.</div>
<table>
  <thead><tr><th>Dia</th><th>Classificação</th><th>Muco</th><th>Sensação</th><th>Relação</th><th>Observações</th></tr></thead>
  <tbody>${linhas}</tbody>
</table>
<div class="foot">
  <p><strong>Legenda:</strong> 🟢 Infértil · 🟡 Fértil · 🔴 Pico · 🔵 Sangramento</p>
  <p style="margin-top:3px;">Gerado pelo app Método Billings · mob-app-five.vercel.app</p>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
