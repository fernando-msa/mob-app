-- ============================================================
-- Método de Ovulação Billings — Schema do banco de dados
-- Execute este SQL no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  muco TEXT,          -- seco | nada | espesso | cremoso | elastico | filante
  sensacao TEXT,      -- seca | umida | molhada | escorregadia | lubricada
  sangramento TEXT DEFAULT 'nenhum', -- nenhum | leve | moderado | intenso
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Row Level Security (RLS)
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa autenticada pode ler e escrever seus próprios dados.
-- Como o app é pessoal (sem login), liberamos acesso anônimo controlado pela anon key.
CREATE POLICY "Acesso público via anon key" ON registros
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índice por data para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros(data);
