import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServerSupabaseClient } from '@/lib/supabase'

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL ?? 'admin@example.com'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { title, body, icon } = await request.json()

    // Busca todas as subscriptions do usuário
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user.id)

    if (error) throw error
    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: 'Nenhuma subscription encontrada' }, { status: 404 })
    }

    const payload = JSON.stringify({
      title: title ?? 'Método Billings',
      body: body ?? 'Lembre-se de registrar seu muco hoje!',
      icon: icon ?? '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
    })

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ ok: true, sent, total: subs.length })
  } catch (err: any) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
