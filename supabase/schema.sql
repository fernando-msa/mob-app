-- ============================================================
-- Método de Ovulação Billings — Schema v2
-- Execute este SQL no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Tabela principal de registros ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registros (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data          DATE        NOT NULL,
  muco          TEXT,        -- seco | nada | espesso | cremoso | elastico | filante
  sensacao      TEXT,        -- seca | umida | molhada | escorregadia | lubricada
  sangramento   TEXT        DEFAULT 'nenhum', -- nenhum | leve | moderado | intenso
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)     -- cada usuário tem só 1 registro por dia
);

-- RLS
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê seus próprios registros" ON registros
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere seus próprios registros" ON registros
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza seus próprios registros" ON registros
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuário deleta seus próprios registros" ON registros
  FOR DELETE USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registros_user_data ON registros(user_id, data DESC);

-- ─── Tabela de push subscriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT        NOT NULL UNIQUE,
  p256dh     TEXT        NOT NULL,
  auth       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia suas subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- ─── Trigger updated_at automático ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registros_updated_at ON registros;
CREATE TRIGGER trg_registros_updated_at
  BEFORE UPDATE ON registros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
