# Configuração da Autenticação e PWA

## 1. Instalar dependências

```bash
npm install @supabase/auth-helpers-nextjs next-pwa
```

## 2. Habilitar Auth no Supabase

No painel do Supabase:
- Vá em **Authentication > Providers**
- Ative **Email** (já vem ativo por padrão)
- Em **Authentication > URL Configuration**, adicione `https://mob-app-five.vercel.app` em **Site URL**

## 3. Aplicar RLS no banco

Execute o arquivo `supabase/rls.sql` no **SQL Editor** do Supabase.

> ⚠️ Após habilitar RLS, registros existentes sem `user_id` ficam invisíveis.
> Antes de aplicar, atualize os registros existentes com o seu user_id se necessário.

## 4. Salvar registros com user_id

No `app/page.tsx`, ao fazer insert/update inclua o `user_id`:

```ts
const { data: { user } } = await supabase.auth.getUser()

const payload: Registro = {
  data: key,
  muco,
  sensacao,
  sangramento,
  observacoes,
  user_id: user?.id,
}
```

## 5. PWA — Ícones

Adicione os ícones em `public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`

Você pode gerar em: https://realfavicongenerator.net ou https://maskable.app/editor

## 6. Botão de logout

Adicione no `app/page.tsx`:

```tsx
import { useAuth } from '@/lib/auth-context'

// dentro do componente:
const { signOut } = useAuth()

// no JSX:
<button onClick={signOut}>Sair</button>
```

## 7. Deploy na Vercel

As variáveis de ambiente já configuradas são suficientes.
O service worker é gerado automaticamente no build de produção.
