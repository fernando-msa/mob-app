import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL ?? 'admin@example.com'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Cliente com service role para leitura de todas as subscriptions
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  // Proteção básica: verifica o secret do cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  // Busca usuários que ainda não registraram hoje
  const hoje = new Date().toISOString().split('T')[0]
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, user_id')

  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  // Para cada subscription, verifica se já registrou hoje
  const { data: registrosHoje } = await supabase
    .from('registros')
    .select('user_id')
    .eq('data', hoje)

  const userIdsComRegistro = new Set(registrosHoje?.map(r => r.user_id) ?? [])
  const subsSemRegistro = subs.filter(s => !userIdsComRegistro.has(s.user_id))

  const payload = JSON.stringify({
    title: '🌿 Método Billings',
    body: 'Não se esqueça de registrar suas observações de hoje!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    url: '/',
  })

  const results = await Promise.allSettled(
    subsSemRegistro.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  const enviados = results.filter(r => r.status === 'fulfilled').length
  const erros    = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ ok: true, enviados, erros, total: subsSemRegistro.length })
}
