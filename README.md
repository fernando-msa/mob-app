# Método de Ovulação Billings — App

App pessoal para registro diário das observações do muco cervical conforme o Método de Ovulação Billings, com autenticação via Magic Link, PWA instalável e notificações push.

---

## Stack

- **Next.js 14** (App Router)
- **Supabase** — banco de dados PostgreSQL + autenticação
- **next-pwa** — PWA com service worker
- **web-push** — notificações push via VAPID

---

## Deploy gratuito (Supabase + Vercel)

### Passo 1 — Banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**
3. Vá em **Authentication → URL Configuration** e adicione em **Redirect URLs**:
   ```
   https://SEU-PROJETO.vercel.app/auth/callback
   ```
4. Em **Settings → API**, copie:
   - **Project URL**
   - **anon public key**

### Passo 2 — Gerar VAPID Keys (Push Notifications)

No terminal, dentro da pasta do projeto:

```bash
npx web-push generate-vapid-keys
```

Anote os valores gerados — você precisará deles no próximo passo.

### Passo 3 — Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Em **Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Key gerada acima |
| `VAPID_PRIVATE_KEY` | Private Key gerada acima |
| `VAPID_EMAIL` | Seu e-mail (ex: `admin@seusite.com`) |

4. Clique em **Deploy**

### Passo 4 — Configurar e-mail no Supabase (Magic Link)

1. Vá em **Authentication → Email Templates**
2. Confirme que o template de **Magic Link** está ativo
3. Em projetos gratuitos, os e-mails são enviados pelo Supabase automaticamente

---

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Gerar VAPID keys (se ainda não fez)
npx web-push generate-vapid-keys

# Rodar localmente
npm run dev
# Acesse http://localhost:3000
```

> **Nota:** O service worker (PWA) é desabilitado em desenvolvimento por padrão. Para testar push localmente, use `npm run build && npm start`.

---

## Estrutura do projeto

```
mob-app/
├── app/
│   ├── api/push/
│   │   ├── subscribe/route.ts   # Salva subscription de push
│   │   └── send/route.ts        # Envia notificação push
│   ├── auth/
│   │   ├── login/page.tsx       # Tela de Magic Link
│   │   └── callback/route.ts    # Callback do Supabase Auth
│   ├── globals.css
│   ├── layout.tsx               # Layout com metadata PWA
│   ├── page.tsx                 # App principal
│   └── page.module.css
├── lib/
│   └── supabase.ts              # Clientes SSR (browser + server) + tipos
├── public/
│   ├── icons/                   # Ícones PWA (72 → 512px)
│   ├── manifest.json            # PWA manifest
│   └── sw-push.js               # Service worker de push
├── supabase/
│   └── schema.sql               # SQL com RLS por usuário
├── middleware.ts                 # Proteção de rotas autenticadas
├── next.config.js               # Configuração com next-pwa
├── .env.example
└── package.json
```

---

## Observação importante

Este app é um auxiliar de registro. Para interpretação segura e personalizada, especialmente nos primeiros ciclos, consulte sempre uma instrutora certificada do Método de Ovulação Billings.
