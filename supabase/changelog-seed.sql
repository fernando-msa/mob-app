-- ============================================================
-- Changelog do Método Billings — dados reais de lançamento
-- Execute no Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- Limpa entradas anteriores (geradas pelo schema inicial)
DELETE FROM changelog;

-- ─── v1.0 — Lançamento ───────────────────────────────────────────────────────
INSERT INTO changelog (versao, titulo, descricao, tipo, data) VALUES
(
  '1.0',
  'App lançado! 🎉',
  'Primeira versão do Método Billings com registro diário de muco cervical, sensação e sangramento. Classificação automática em Infértil, Fértil, Pico e Sangramento.',
  'novo',
  '2025-01-01'
),
(
  '1.0',
  'Login seguro com Magic Link',
  'Acesso por e-mail sem precisar de senha. Você recebe um link no e-mail e entra com um clique — sem riscos de senha esquecida.',
  'novo',
  '2025-01-01'
),
(
  '1.0',
  'App instalável no celular (PWA)',
  'O Método Billings pode ser instalado direto do navegador como um app nativo, sem precisar de App Store ou Play Store.',
  'novo',
  '2025-01-01'
),
(
  '1.0',
  'Histórico dos últimos 90 dias',
  'Visualize todos os seus registros recentes em uma lista com classificação por cor, podendo clicar para editar qualquer dia passado.',
  'novo',
  '2025-01-01'
);

-- ─── v1.1 — Relação e Calendário ─────────────────────────────────────────────
INSERT INTO changelog (versao, titulo, descricao, tipo, data) VALUES
(
  '1.1',
  'Login com e-mail e senha',
  'Além do Magic Link, agora você pode criar uma conta com e-mail e senha. Também adicionamos as telas de Cadastro e de Recuperação de senha por e-mail.',
  'novo',
  '2025-01-15'
),
(
  '1.1',
  'Aviso clínico na tela de login',
  'Adicionamos um aviso importante na entrada do app lembrando que o Método Billings deve ser acompanhado por uma instrutora certificada ou ginecologista.',
  'melhoria',
  '2025-01-15'
),
(
  '1.1',
  'Campo "Teve relação" no registro',
  'Agora é possível registrar se houve relação sexual no dia. O app exibe um alerta automático quando a relação é registrada em dias Fértil ou Pico.',
  'novo',
  '2025-01-15'
),
(
  '1.1',
  'Calendário mensal dos 90 dias',
  'Nova tela de calendário em grade com um ponto colorido por dia. Toque em qualquer dia para ver os detalhes completos do registro. Navega entre os últimos 3 meses.',
  'novo',
  '2025-01-15'
),
(
  '1.1',
  'Exportação do relatório em PDF',
  'Gere um relatório mensal completo com todos os seus registros para levar para sua instrutora ou médica. Disponível no calendário e na tela de gráfico.',
  'novo',
  '2025-01-15'
);

-- ─── v1.2 — Personalização e Feedback ────────────────────────────────────────
INSERT INTO changelog (versao, titulo, descricao, tipo, data) VALUES
(
  '1.2',
  'Perfil personalizado com nome e tema',
  'Na primeira entrada, o app pede seu nome e sua cor favorita. A partir daí, você é recebida pelo nome toda vez que abre o app, e o tema de cor é aplicado em toda a interface.',
  'novo',
  '2025-02-01'
),
(
  '1.2',
  '6 temas de cor disponíveis',
  'Escolha entre Violeta, Rosa, Azul, Verde, Laranja e Teal para personalizar o visual do app. O tema pode ser alterado a qualquer momento nas configurações de perfil.',
  'novo',
  '2025-02-01'
),
(
  '1.2',
  'Saudação dinâmica por horário',
  'O app agora te cumprimenta com "Bom dia", "Boa tarde" ou "Boa noite" de acordo com o horário em que você abre o app.',
  'melhoria',
  '2025-02-01'
),
(
  '1.2',
  'Prompt de instalação do app',
  'Quando o app detecta que pode ser instalado no seu celular, exibe um banner discreto sugerindo a instalação. Você decide se quer instalar ou não.',
  'melhoria',
  '2025-02-01'
),
(
  '1.2',
  'Aba de Feedback integrada',
  'Encontrou um erro ou tem uma sugestão? Agora você pode enviar diretamente pelo app, classificando como Bug, Sugestão, Elogio ou Outro.',
  'novo',
  '2025-02-01'
),
(
  '1.2',
  'Tela de Novidades (você está aqui!)',
  'Adicionamos esta tela para que você sempre saiba o que mudou no app a cada atualização. Um ponto vermelho aparece no ícone quando há novidades não lidas.',
  'novo',
  '2025-02-01'
);

-- ─── v1.3 — Regra pós-pico, Gráfico e Glossário ──────────────────────────────
INSERT INTO changelog (versao, titulo, descricao, tipo, data) VALUES
(
  '1.3',
  'Regra dos 3 dias pós-pico implementada',
  'O app agora aplica automaticamente a regra central do Método Billings: os 3 dias seguintes ao Pico são sinalizados em laranja 🟠 como "Pós-pico", pois ainda fazem parte do período fértil.',
  'novo',
  '2025-02-15'
),
(
  '1.3',
  'Badge pós-pico no calendário e histórico',
  'Os dias de pós-pico aparecem com um número (+1, +2, +3) no calendário e no histórico, indicando em qual dia do período pós-pico você está.',
  'melhoria',
  '2025-02-15'
),
(
  '1.3',
  'Gráfico do ciclo',
  'Nova tela com linha do tempo visual do seu ciclo, mostrando a progressão da fertilidade dia a dia. Inclui barra de proporção fértil/infértil e resumo completo do mês.',
  'novo',
  '2025-02-15'
),
(
  '1.3',
  'Chips de observações rápidas',
  'No campo de observações, adicionamos 12 chips clicáveis com sintomas comuns: cólica, dor pélvica, dor ovulatória, tensão mamária, estresse, viagem, medicação e outros. Clique para adicionar ao texto.',
  'melhoria',
  '2025-02-15'
),
(
  '1.3',
  'Glossário dos termos do Método Billings',
  'Nova seção com explicação de todos os termos usados no app: tipos de muco (seco, cremoso, filante...), sensações (seca, escorregadia, lubrificada...) e regras do método com dicas práticas.',
  'novo',
  '2025-02-15'
),
(
  '1.3',
  'Lembrete diário automático às 20h',
  'Se você tiver as notificações ativadas e ainda não tiver registrado no dia, o app envia automaticamente um lembrete às 20h para não esquecer.',
  'novo',
  '2025-02-15'
),
(
  '1.3',
  'Classificação com contexto de dias anteriores',
  'A lógica de classificação foi aprimorada para considerar os dias anteriores ao calcular o pós-pico, tornando o app muito mais fiel às regras reais do Método Billings.',
  'melhoria',
  '2025-02-15'
);
