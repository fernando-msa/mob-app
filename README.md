<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&pause=1000&color=008080&center=true&vCenter=true&width=600&lines=Método+de+Ovulação+Billings+—+App" alt="Typing SVG" />

# 🌸 MOB App — Método de Ovulação Billings

**Aplicação web PWA para registro diário de observações do muco cervical.**  
Simples, segura, multi-usuário e 100% gratuita para hospedar.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 Sobre o Projeto

O **MOB App** é uma aplicação web desenvolvida para facilitar o registro diário das observações do muco cervical conforme o **Método de Ovulação Billings (MOB)** — um método natural de planejamento familiar reconhecido pela OMS.

A aplicação foi construída com foco em **privacidade**, **simplicidade de uso** e **acessibilidade**, sendo um projeto open source com deploy gratuito via Supabase + Vercel.

---

## ✨ Funcionalidades

- 📅 **Registro diário** de observações do ciclo
- 🔐 **Autenticação multi-usuário** com Supabase Auth
- 🛡️ **Row Level Security (RLS)** — cada usuária acessa apenas seus próprios dados
- 📱 **PWA Ready** — instalável como app no celular
- 🌍 **Deploy gratuito** com Supabase + Vercel
- 💻 **Responsivo** — funciona em mobile e desktop

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **Next.js 14** | Framework React com App Router |
| **TypeScript** | Tipagem estática |
| **Supabase** | Banco de dados PostgreSQL + Autenticação |
| **Vercel** | Hospedagem e deploy contínuo |

---

## 🚀 Como Fazer o Deploy Gratuito

### Pré-requisitos

- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita no [Vercel](https://vercel.com) (pode logar com o GitHub)
- Conta no [GitHub](https://github.com)

---

### Passo 1 — Configurar o Banco de Dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New project** e preencha:
   - **Nome do projeto:** `billings-app` (ou o que preferir)
   - **Senha do banco:** anote em local seguro
   - **Região:** South America (São Paulo) — mais rápido para o Brasil
3. Aguarde o projeto criar (~1 minuto)
4. No menu lateral: **SQL Editor → New query**
5. Cole o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**
6. Vá em **Settings → API** e copie:
   - `Project URL` → ex: `https://abcdef.supabase.co`
   - `anon public key` → chave que começa com `eyJ...`

---

### Passo 2 — Subir o Código no GitHub

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

1. Acesse [vercel.com](https://vercel.com) e entre com sua conta GitHub
2. Clique em **Add New → Project**
3. Selecione o repositório `billings-app` e clique em **Import**
4. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → sua Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → sua anon key
5. Clique em **Deploy** e aguarde (~1–2 minutos)
6. ✅ Pronto! Sua URL estará disponível em `https://billings-app.vercel.app`

---

## 💻 Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/fernando-msa/mob-app.git
cd mob-app

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Rode localmente
npm run dev
# Acesse: http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
mob-app/
├── app/
│   ├── globals.css          # Estilos globais e variáveis CSS
│   ├── layout.tsx           # Layout raiz do Next.js
│   ├── page.tsx             # App principal (lógica + interface)
│   └── page.module.css      # Estilos do app
├── lib/
│   └── supabase.ts          # Cliente Supabase + tipos + classificação
├── supabase/
│   └── schema.sql           # SQL para criação da tabela no banco
├── .env.example             # Template das variáveis de ambiente
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## ⚠️ Aviso Importante

> Este app é um **auxiliar de registro**. Para interpretação segura e personalizada do método, especialmente nos primeiros ciclos, **consulte sempre uma instrutora certificada do Método de Ovulação Billings**.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](./LICENSE) para mais detalhes.

---

<div align="center">

Desenvolvido por [Fernando S. De Santana Júnior](https://github.com/fernando-msa)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-junior-1a74ab29b/)

</div>
