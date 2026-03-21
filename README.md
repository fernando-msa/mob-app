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

- **Autenticação completa** — login com e-mail+senha ou Magic Link, cadastro e recuperação de senha
- **Onboarding personalizado** — nome e tema de cor na 1ª entrada; boas-vindas em toda sessão
- **6 temas de cor** — Violeta, Rosa, Azul, Verde, Laranja e Teal
- **Registro diário** — muco, sensação, sangramento, relação sexual e observações
- **Classificação automática** — Infértil 🟢 · Fértil 🟡 · Pico 🔴 · Sangramento 🔵
- **Alerta de relação fértil** — aviso em dias Fértil ou Pico com relação registrada
- **Calendário mensal** — grade dos últimos 90 dias com painel de detalhe e resumo
- **Exportação PDF** — relatório mensal completo para compartilhar com instrutora ou médica
- **Changelog de versões** — novidades do app com badge de não lidas, gerenciado pelo Supabase
- **Feedback integrado** — as usuárias enviam sugestões e erros direto pelo app
- **Prompt de instalação PWA** — banner inteligente para instalar o app na tela inicial
- **Notificações push** — lembretes diários configuráveis
- **Multi-usuário com RLS** — dados completamente isolados por conta
- **Dark mode** — segue automaticamente a preferência do sistema

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

1. Acesse [supabase.com](https://supabase.com) e crie um projeto (região: **South America — São Paulo**)
2. Vá em **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**
3. Em **Authentication → URL Configuration → Redirect URLs**, adicione:
   ```
   https://SEU-PROJETO.vercel.app/auth/callback
   https://SEU-PROJETO.vercel.app/auth/reset
   ```
4. Em **Settings → API**, copie a **Project URL** e a **anon public key**

### 2 — Templates de e-mail (recomendado)

Em **Authentication → Email Templates**:

| Template | Assunto |
|---|---|
| Magic Link | `✨ Seu link de acesso — Método Billings` |
| Reset Password | `🔑 Redefinir senha — Método Billings` |

Cole os arquivos `supabase/email-magic-link.html` e `supabase/email-reset-senha.html`.

### 3 — VAPID Keys (notificações push)

```bash
npx web-push generate-vapid-keys
```

### 4 — Deploy na Vercel

1. Faça push para o GitHub e importe o repositório na Vercel
2. Adicione as **5 variáveis de ambiente**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=seu@email.com
```

3. Deploy! 🎉

---

## 🆕 Gerenciar changelog (novidades)

O changelog é gerenciado pela tabela `changelog` no Supabase. Para publicar novidades:

1. Acesse **Supabase → Table Editor → changelog**
2. Clique em **Insert row** e preencha:
   - `versao` — ex: `1.3`
   - `titulo` — ex: `Gráfico do ciclo`
   - `descricao` — descrição da novidade
   - `tipo` — `novo`, `melhoria` ou `correcao`
   - `data` — data do lançamento

As usuárias verão um badge 🔴 no ícone de novidades até acessarem a página.

---

## 💻 Desenvolvimento local

```bash
git clone https://github.com/fernando-msa/mob-app.git
cd mob-app
npm install
cp .env.example .env.local
# Edite .env.local com suas credenciais
npm run dev
```

> PWA e push notifications só funcionam em produção (`npm run build && npm start`).

---

## 📁 Estrutura do projeto

```
mob-app/
├── app/
│   ├── api/
│   │   ├── export-pdf/route.ts      # Gera relatório HTML/PDF mensal
│   │   └── push/{subscribe,send}/   # Notificações push
│   ├── auth/
│   │   ├── auth.module.css          # Estilos compartilhados
│   │   ├── login/                   # E-mail+senha e Magic Link
│   │   ├── signup/                  # Cadastro
│   │   ├── forgot/                  # Esqueceu a senha
│   │   ├── reset/                   # Redefinir senha
│   │   └── callback/                # Callback do Supabase Auth
│   ├── calendar/                    # Calendário mensal + export PDF
│   ├── changelog/                   # Novidades da versão
│   ├── feedback/                    # Formulário de feedback
│   ├── onboarding/                  # Tela de boas-vindas (1ª vez)
│   ├── profile/                     # Editar perfil e tema
│   ├── ThemeLoader.tsx              # Aplica tema antes do hydrate
│   ├── globals.css                  # Variáveis de tema (6 paletas)
│   ├── layout.tsx
│   ├── page.tsx                     # Tela principal
│   └── page.module.css
├── lib/
│   ├── supabase.ts                  # Cliente browser + tipos
│   ├── supabase-server.ts           # Cliente server (Route Handlers)
│   └── profile.ts                   # Helpers de perfil e tema
├── public/
│   ├── icons/                       # Ícones PWA
│   ├── manifest.json
│   └── sw-push.js                   # Service worker de push
├── supabase/
│   ├── schema.sql                   # Schema v4 — todas as tabelas
│   ├── email-magic-link.html        # Template Magic Link
│   └── email-reset-senha.html       # Template reset de senha
├── middleware.ts
├── next.config.js
└── .env.example
```

---

## 🔐 Segurança

- Login sem senha armazenada em texto plano (hash bcrypt via Supabase)
- Magic Link com expiração de 1 hora
- Reset de senha com link temporário por e-mail
- Row Level Security (RLS) — cada usuária acessa apenas seus dados
- Rotas protegidas via middleware Next.js
- Chaves VAPID autenticadas para push notifications
