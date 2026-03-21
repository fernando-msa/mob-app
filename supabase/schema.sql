-- ============================================================
-- Método de Ovulação Billings — Schema v4
-- Execute no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- ─── Perfis de usuário ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT,
  tema          TEXT        DEFAULT 'violeta',
  onboarding_completo BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário gerencia seu perfil" ON profiles;
CREATE POLICY "Usuário gerencia seu perfil" ON profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── Registros diários ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registros (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data          DATE        NOT NULL,
  muco          TEXT,
  sensacao      TEXT,
  sangramento   TEXT        DEFAULT 'nenhum',
  relacao       BOOLEAN     DEFAULT false,
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);
ALTER TABLE registros ADD COLUMN IF NOT EXISTS relacao BOOLEAN DEFAULT false;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário lê seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário insere seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário atualiza seus próprios registros" ON registros;
DROP POLICY IF EXISTS "Usuário deleta seus próprios registros" ON registros;
CREATE POLICY "Usuário lê seus próprios registros"    ON registros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuário insere seus próprios registros" ON registros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário atualiza seus próprios registros" ON registros FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuário deleta seus próprios registros" ON registros FOR DELETE USING (auth.uid() = user_id);
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

-- ─── Feedbacks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedbacks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo       TEXT        NOT NULL CHECK (tipo IN ('bug','melhoria','elogio','outro')),
  mensagem   TEXT        NOT NULL,
  contato    TEXT,
  lido       BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuário envia feedback" ON feedbacks;
DROP POLICY IF EXISTS "Usuário lê seu feedback" ON feedbacks;
CREATE POLICY "Usuário envia feedback" ON feedbacks FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuário lê seu feedback" ON feedbacks FOR SELECT USING (auth.uid() = user_id);

-- ─── Changelog de versões ────────────────────────────────────────────────────
-- Esta tabela é gerenciada pelo administrador via Supabase Dashboard
CREATE TABLE IF NOT EXISTS changelog (
  id        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  versao    TEXT        NOT NULL,
  titulo    TEXT        NOT NULL,
  descricao TEXT        NOT NULL,
  tipo      TEXT        NOT NULL CHECK (tipo IN ('novo','melhoria','correcao')),
  data      DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Qualquer um lê changelog" ON changelog;
CREATE POLICY "Qualquer um lê changelog" ON changelog FOR SELECT USING (true);

-- ─── Dados iniciais do changelog ─────────────────────────────────────────────
INSERT INTO changelog (versao, titulo, descricao, tipo, data) VALUES
  ('1.0', 'App lançado! 🎉', 'Primeira versão do Método Billings com registro diário de muco, sensação e sangramento.', 'novo', CURRENT_DATE),
  ('1.0', 'Autenticação segura', 'Login com e-mail e senha ou Magic Link. Seus dados ficam protegidos por conta individual.', 'novo', CURRENT_DATE),
  ('1.0', 'PWA instalável', 'O app pode ser instalado no celular direto do navegador, como um app nativo.', 'novo', CURRENT_DATE),
  ('1.1', 'Campo de relação', 'Agora é possível registrar se houve relação sexual no dia, com alerta automático em dias férteis.', 'novo', CURRENT_DATE),
  ('1.1', 'Calendário mensal', 'Visualize os últimos 90 dias em grade de calendário com classificação por cor.', 'novo', CURRENT_DATE),
  ('1.2', 'Personalização de perfil', 'Escolha seu nome e tema de cor favorito para deixar o app com a sua cara.', 'novo', CURRENT_DATE),
  ('1.2', 'Feedback integrado', 'Envie sugestões e relatos de erros diretamente pelo app.', 'novo', CURRENT_DATE),
  ('1.2', 'Exportação PDF do calendário', 'Exporte o relatório mensal em PDF para compartilhar com sua instrutora ou médica.', 'novo', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ─── Trigger updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registros_updated_at ON registros;
CREATE TRIGGER trg_registros_updated_at BEFORE UPDATE ON registros FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
