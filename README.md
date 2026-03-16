# Método de Ovulação Billings — App

## Deploy (Vercel)

### 1. Variáveis de ambiente na Vercel

No painel da Vercel, ao importar o repositório, adicione estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://imdfdlmitprbsmwbgafa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZGZkbG1pdHByYnNtd2JnYWZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTgwODUsImV4cCI6MjA4OTA5NDA4NX0.Pk2-EkLHBWV4ltUN3tSjgM9mE74SAxTfTkbWSLjxy18
```

### 2. Desenvolvimento local

```bash
npm install
cp .env.example .env.local
npm run dev
```
