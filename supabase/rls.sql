-- Habilitar RLS na tabela registros
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna user_id se não existir
ALTER TABLE registros ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Política: usuário só vê seus próprios registros
CREATE POLICY "usuarios veem apenas seus registros"
  ON registros FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuário só insere com seu próprio user_id
CREATE POLICY "usuarios inserem seus proprios registros"
  ON registros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuário só atualiza seus próprios registros
CREATE POLICY "usuarios atualizam seus proprios registros"
  ON registros FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuário só deleta seus próprios registros
CREATE POLICY "usuarios deletam seus proprios registros"
  ON registros FOR DELETE
  USING (auth.uid() = user_id);
