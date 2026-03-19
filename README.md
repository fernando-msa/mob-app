# 🌸 Método de Ovulação Billings

App pessoal para registro diário do ciclo conforme o **Método de Ovulação Billings**, aceito pela Igreja Católica Apostólica Romana.

🔗 **Acesse o app:** https://mob-app-five.vercel.app

---

## Funcionalidades

### 📝 Registro diário

- Navegue por qualquer dia do ciclo com as setas ← →
- Registre o **tipo de muco cervical:**
  - Seco
  - Nada percebido
  - Espesso / pastoso
  - Cremoso / branco
  - Elástico / transparente
  - Filante (clara de ovo)
- Registre a **sensação na vulva:** seca, úmida, molhada, escorregadia ou lubrificada
- Registre o **sangramento:** nenhum, leve (mancha), moderado ou intenso
- Campo livre para **observações** adicionais (dor, desconforto, etc.)
- Dados salvos automaticamente na nuvem via Supabase

### 🔍 Interpretação automática

O app classifica cada dia automaticamente conforme as regras do método:

| Classificação | Sinais |
|---|---|
| 🟢 Fase infértil | Dia seco, sem muco, sensação seca |
| 🟠 Fase fértil | Muco cremoso/pastoso, sensação úmida/molhada |
| 🟣 Dia Pico / alta fertilidade | Muco filante, sensação escorregadia/lubrificada |
| 🔴 Menstruação / manchas | Qualquer sangramento |

Cada fase exibe uma **orientação específica** conforme o método.

### 📅 Calendário do ciclo

- Visualização mensal com pontos coloridos por categoria
- Clique em qualquer dia para abrir o registro
- Navegação entre meses

### 📧 Notificação por e-mail

A cada registro salvo, um e-mail é enviado automaticamente com:
- Data do registro
- Classificação da fase
- Muco, sensação e sangramento registrados
- Observações livres

### 📖 Regras do método

Consulta rápida das principais regras do Método Billings:
- Regra do Dia Seco
- Identificação do Dia Pico
- Regra do Pico (pós-pico)
- Orientações sobre menstruação e manchas pré-menstruais

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | [Next.js 14](https://nextjs.org/) + TypeScript |
| Banco de dados | [Supabase](https://supabase.com/) (PostgreSQL) |
| E-mail | [Resend](https://resend.com/) via Supabase Edge Functions |
| Hospedagem | [Vercel](https://vercel.com/) |

---

## Desenvolvimento local

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)

### Configuração

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
# Acesse http://localhost:3000
```

### Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

> As instruções para criar o banco de dados estão no arquivo `supabase/schema.sql`.

---

## Estrutura do projeto

```
mob-app/
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
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Versões

### v1.1 — atual

- Notificação automática por e-mail a cada registro salvo (Resend + Supabase Edge Functions)
- Correções de estabilidade no deploy (lazy init do Supabase)

### v1.0

- Registro diário de muco, sensação e sangramento
- Interpretação automática por fase
- Calendário mensal do ciclo
- Regras do método para consulta rápida
- Persistência em nuvem via Supabase

---

## ⚠️ Observação importante

Este app é um **auxiliar de registro**. Para interpretação segura e personalizada, especialmente nos primeiros ciclos, consulte sempre uma instrutora certificada do Método de Ovulação Billings.

---

## Licença

Distribuído sob licença [MIT](LICENSE).

---

## Autor

**Fernando S. De Santana Júnior**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-junior-1a74ab29b/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/fernando-msa)
