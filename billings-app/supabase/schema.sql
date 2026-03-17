-- ============================================================
-- Método de Ovulação Billings — Schema do banco de dados
-- Execute este SQL no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  data DATE NOT NULL,
  muco TEXT,          -- seco | nada | espesso | cremoso | elastico | filante
  sensacao TEXT,      -- seca | umida | molhada | escorregadia | lubricada
  sangramento TEXT DEFAULT 'nenhum', -- nenhum | leve | moderado | intenso
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Habilita Row Level Security (RLS)
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados podem ver apenas seus próprios registros.
CREATE POLICY "Usuários podem ver seus próprios registros" ON registros
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários autenticados podem inserir seus próprios registros.
CREATE POLICY "Usuários podem inserir seus próprios registros" ON registros
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários autenticados podem atualizar seus próprios registros.
CREATE POLICY "Usuários podem atualizar seus próprios registros" ON registros
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Índice por data para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros(data);
