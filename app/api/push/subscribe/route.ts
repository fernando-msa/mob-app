import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Dados de subscription inválidos' }, { status: 400 })
    }

    // Upsert: atualiza se já existe para esse endpoint
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, { onConflict: 'endpoint' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[push/subscribe]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
