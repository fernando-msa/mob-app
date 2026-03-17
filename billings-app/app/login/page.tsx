'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', backgroundColor: '#fff5f7', padding: '20px' 
    }}>
      <div style={{ 
        width: '100%', maxWidth: '400px', background: 'white', 
        padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ textAlign: 'center', color: '#d63384', marginBottom: '20px' }}>
          🌸 MOB App Login
        </h2>
        <Auth
          supabaseClient={supabase}
          view="magic_link"
          appearance={{ theme: ThemeSupa }}
          theme="light"
          showLinks={false}
          providers={['google']}
          redirectTo={`${origin}/auth/callback`}
        />
      </div>
    </div>
  )
}
