-- ============================================================
-- Método de Ovulação Billings — Schema v3
-- Execute no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Tabela principal de registros ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registros (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data          DATE        NOT NULL,
  muco          TEXT,        -- seco | nada | espesso | cremoso | elastico | filante
  sensacao      TEXT,        -- seca | umida | molhada | escorregadia | lubricada
  sangramento   TEXT        DEFAULT 'nenhum', -- nenhum | leve | moderado | intenso
  relacao       BOOLEAN     DEFAULT false,    -- teve relação sexual no dia
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

-- Migração segura: adiciona coluna se não existir (para bancos existentes)
ALTER TABLE registros ADD COLUMN IF NOT EXISTS relacao BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário lê seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário insere seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário atualiza seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário deleta seus próprios registros" ON registros;

CREATE POLICY "Usuário lê seus próprios registros" ON registros
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário insere seus próprios registros" ON registros
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza seus próprios registros" ON registros
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuário deleta seus próprios registros" ON registros
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_registros_user_data ON registros(user_id, data DESC);

-- ─── Push subscriptions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT        NOT NULL UNIQUE,
  p256dh     TEXT        NOT NULL,
  auth       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas subscriptions" ON push_subscriptions;
CREATE POLICY "Usuário gerencia suas subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registros_updated_at ON registros;
CREATE TRIGGER trg_registros_updated_at
  BEFORE UPDATE ON registros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
