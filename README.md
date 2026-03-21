<div align="center">

# 🌿 Método de Ovulação Billings

**App web para registro diário do muco cervical**  
Autenticação segura · PWA instalável · Notificações push · Deploy gratuito

[![Deploy](https://img.shields.io/badge/Vercel-Live-black?logo=vercel)](https://mob-app-five.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-violet)](LICENSE)

</div>

---

## ✨ Funcionalidades

- **Autenticação completa** — login com e-mail+senha ou Magic Link, cadastro, recuperação de senha por e-mail
- **Registro diário** — muco, sensação, sangramento, relação sexual e observações livres
- **Classificação automática** — Infértil 🟢 · Fértil 🟡 · Pico 🔴 · Sangramento 🔵
- **Alerta de relação fértil** — aviso destacado quando há relação registrada em dia Fértil ou Pico
- **Calendário mensal** — visualização dos últimos 90 dias em grade, com painel de detalhe por dia e resumo do mês
- **Histórico** — lista dos registros recentes com ícones de alerta e navegação rápida
- **PWA** — instalável no celular como app nativo (Android e iOS)
- **Notificações push** — lembrete diário configurável
- **Multi-usuário** — dados isolados por conta via RLS no Supabase
- **Dark mode** — segue automaticamente a preferência do sistema
- **E-mails personalizados** — templates HTML customizados para Magic Link e recuperação de senha

---

## ⚕️ Aviso importante

Este app é um **auxiliar de registro pessoal**. Para interpretação segura e personalizada do ciclo, especialmente nos primeiros meses, consulte sempre uma **instrutora certificada do MOB** ou seu **ginecologista**.

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth — Magic Link + Email/Senha |
| PWA | next-pwa + Web Push API |
| Deploy | Vercel |
| Linguagem | TypeScript |

---

## 🚀 Deploy gratuito (Supabase + Vercel)

### 1 — Banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
   - Região recomendada: **South America (São Paulo)**
2. Vá em **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**
3. Em **Authentication → URL Configuration**, adicione em **Redirect URLs**:
   ```
   https://SEU-PROJETO.vercel.app/auth/callback
   https://SEU-PROJETO.vercel.app/auth/reset
   ```
4. Em **Settings → API**, copie a **Project URL** e a **anon public key**

### 2 — Templates de e-mail (opcional, mas recomendado)

Em **Authentication → Email Templates**:

| Template | Assunto |
|---|---|
| Magic Link | `✨ Seu link de acesso — Método Billings` |
| Reset Password | `🔑 Redefinir senha — Método Billings` |

Cole o conteúdo dos arquivos `supabase/email-magic-link.html` e `supabase/email-reset-senha.html` nos respectivos campos.

### 3 — VAPID Keys (notificações push)

```bash
npx web-push generate-vapid-keys
```

Guarde os dois valores gerados.

### 4 — Deploy na Vercel

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com), importe o repositório
3. Em **Environment Variables**, adicione as 5 variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=seu@email.com
```

4. Clique em **Deploy** — pronto 🎉

---

## 💻 Desenvolvimento local

```bash
# Clonar e instalar
git clone https://github.com/fernando-msa/mob-app.git
cd mob-app
npm install

# Configurar variáveis
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rodar
npm run dev
# http://localhost:3000
```

> O service worker (PWA) é desabilitado em `development` por padrão.  
> Para testar push localmente: `npm run build && npm start`

---

## 📁 Estrutura do projeto

```
mob-app/
├── app/
│   ├── api/push/
│   │   ├── subscribe/route.ts   # Salva subscription de push
│   │   └── send/route.ts        # Envia notificação push
│   ├── auth/
│   │   ├── auth.module.css      # Estilos compartilhados de auth
│   │   ├── login/page.tsx       # Login — e-mail+senha e Magic Link
│   │   ├── signup/page.tsx      # Cadastro de nova conta
│   │   ├── forgot/page.tsx      # Esqueceu a senha
│   │   ├── reset/page.tsx       # Redefinir senha (via link do e-mail)
│   │   └── callback/route.ts    # Callback do Supabase Auth
│   ├── calendar/
│   │   ├── page.tsx             # Calendário mensal dos últimos 90 dias
│   │   └── calendar.module.css
│   ├── globals.css              # Variáveis de tema + reset
│   ├── layout.tsx               # Layout raiz com metadata PWA
│   ├── page.tsx                 # Tela principal de registro
│   └── page.module.css
├── lib/
│   ├── supabase.ts              # Cliente browser + tipos + classificação
│   └── supabase-server.ts       # Cliente server (Route Handlers)
├── public/
│   ├── icons/                   # Ícones PWA (72px → 512px)
│   ├── manifest.json            # PWA manifest
│   └── sw-push.js               # Service worker de push
├── supabase/
│   ├── schema.sql               # Tabelas + RLS por usuário (v3)
│   ├── email-magic-link.html    # Template HTML — Magic Link
│   └── email-reset-senha.html   # Template HTML — Recuperação de senha
├── middleware.ts                 # Proteção de rotas autenticadas
├── next.config.js               # Configuração PWA
└── .env.example                 # Template de variáveis
```

---

## 🔐 Segurança

- Login com e-mail+senha ou Magic Link — sem senha armazenada em texto plano
- Fluxo completo de recuperação de senha via e-mail com link temporário
- Row Level Security (RLS) no Supabase — cada usuário acessa apenas seus próprios dados
- Rotas protegidas via middleware Next.js
- Chaves VAPID para push notifications autenticadas
