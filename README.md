# Método de Ovulação Billings — App

App pessoal para registro diário das observações do muco cervical conforme o Método de Ovulação Billings.

---

## Como fazer o deploy gratuito (Supabase + Vercel)

### Passo 1 — Criar o banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New project** e preencha:
   - Nome do projeto: `billings-app` (ou o que preferir)
   - Senha do banco: anote em local seguro
   - Região: **South America (São Paulo)** — mais rápido para o Brasil
3. Aguarde o projeto criar (cerca de 1 minuto)
4. No menu lateral, clique em **SQL Editor** → **New query**
5. Cole o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**
6. Vá em **Settings** → **API** e copie:
   - **Project URL** (ex: `https://abcdef.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

---

### Passo 2 — Subir o código no GitHub

1. Acesse [github.com](https://github.com) e crie uma conta gratuita se não tiver
2. Clique em **New repository** → nomeie como `billings-app` → **Create repository**
3. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/billings-app.git
git push -u origin main
```

---

### Passo 3 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta gratuita (pode entrar com o GitHub)
2. Clique em **Add New → Project**
3. Selecione o repositório `billings-app` e clique em **Import**
4. Em **Environment Variables**, adicione as duas variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` → cole a Project URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → cole a anon key do Supabase
5. Clique em **Deploy** e aguarde (cerca de 1–2 minutos)
6. Pronto! A Vercel vai gerar uma URL como `https://billings-app.vercel.app`

---

### Desenvolvimento local (opcional)

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e preencha com suas credenciais do Supabase

# Rodar localmente
npm run dev
# Acesse http://localhost:3000
```

---

## Estrutura do projeto

```
billings-app/
├── app/
│   ├── globals.css       # Estilos globais e variáveis
│   ├── layout.tsx        # Layout raiz do Next.js
│   ├── page.tsx          # App principal (lógica + interface)
│   └── page.module.css   # Estilos do app
├── lib/
│   └── supabase.ts       # Cliente Supabase + tipos + classificação
├── supabase/
│   └── schema.sql        # SQL para criar a tabela no Supabase
├── .env.example          # Template das variáveis de ambiente
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Observação importante

Este app é um auxiliar de registro. Para interpretação segura e personalizada, especialmente nos primeiros ciclos, consulte sempre uma instrutora certificada do Método de Ovulação Billings.
