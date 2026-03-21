'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './help.module.css'

type Item = { termo: string; emoji: string; descricao: string; dica?: string }

const SECOES: { titulo: string; itens: Item[] }[] = [
  {
    titulo: 'Tipos de muco',
    itens: [
      {
        termo: 'Seco', emoji: '🏜️',
        descricao: 'Nenhuma secreção visível ou sensação de umidade. Tipicamente indica período infértil.',
        dica: 'Roupa íntima fica completamente seca ao longo do dia.',
      },
      {
        termo: 'Nada', emoji: '⬜',
        descricao: 'Sem muco observável externamente, mas sem sensação de secura total.',
      },
      {
        termo: 'Espesso', emoji: '🟫',
        descricao: 'Muco denso, opaco e pastoso, geralmente branco ou amarelado. Pode indicar fase de transição.',
      },
      {
        termo: 'Cremoso', emoji: '🥛',
        descricao: 'Textura suave, parecida com creme ou loção. Branco ou creme. Indica aproximação da fase fértil.',
        dica: 'Sensação úmida ou molhada ao toque.',
      },
      {
        termo: 'Elástico', emoji: '🔗',
        descricao: 'Muco que estica entre os dedos sem romper, mais transparente. Sinal de fertilidade crescente.',
      },
      {
        termo: 'Filante (em fio)', emoji: '🕸️',
        descricao: 'Muco muito transparente, escorregadio e elástico, semelhante à clara de ovo crua. Indica o período de maior fertilidade — o Pico.',
        dica: 'Pode esticar vários centímetros sem romper. É o sinal mais fértil.',
      },
    ],
  },
  {
    titulo: 'Sensações',
    itens: [
      {
        termo: 'Seca', emoji: '🔥',
        descricao: 'Região vulvar sem umidade perceptível ao longo do dia. Geralmente associada ao período infértil.',
      },
      {
        termo: 'Úmida', emoji: '💧',
        descricao: 'Leve sensação de umidade, sem escorregamento. Pode indicar transição para fase fértil.',
      },
      {
        termo: 'Molhada', emoji: '💦',
        descricao: 'Umidade mais acentuada, perceptível durante atividades. Sinal de aproximação do período fértil.',
      },
      {
        termo: 'Escorregadia', emoji: '🫧',
        descricao: 'Sensação de escorregamento semelhante a lubrificação. Fortemente associada ao Pico.',
      },
      {
        termo: 'Lubrificada', emoji: '✨',
        descricao: 'Sensação de lubrificação intensa, semelhante à da relação sexual. Indica o Pico de fertilidade.',
        dica: 'Esta é a sensação máxima de fertilidade no Método Billings.',
      },
    ],
  },
  {
    titulo: 'Classificações do dia',
    itens: [
      {
        termo: 'Infértil 🟢', emoji: '🟢',
        descricao: 'Dia com padrão seco ou básico infértil. Probabilidade baixa de gestação.',
        dica: 'Muco seco/nada + sensação seca.',
      },
      {
        termo: 'Fértil 🟡', emoji: '🟡',
        descricao: 'Dia com sinais de transição para o período fértil. Atenção recomendada.',
        dica: 'Muco cremoso ou elástico / sensação úmida ou molhada.',
      },
      {
        termo: 'Pico 🔴', emoji: '🔴',
        descricao: 'Dia de máxima fertilidade. Muco filante ou sensação escorregadia/lubrificada.',
        dica: 'O Pico é o último dia do muco escorregadio — identificado retrospectivamente.',
      },
      {
        termo: 'Pós-pico 🟠', emoji: '🟠',
        descricao: 'Os 3 dias seguintes ao Pico ainda são considerados férteis pelo Método Billings.',
        dica: 'A fertilidade só retorna ao padrão básico infértil após esses 3 dias.',
      },
      {
        termo: 'Sangramento 🔵', emoji: '🔵',
        descricao: 'Dia com sangramento menstrual ou irregular. Registre a intensidade (leve/moderado/intenso).',
      },
    ],
  },
  {
    titulo: 'Regras do Método',
    itens: [
      {
        termo: 'Regra dos 3 dias pós-pico', emoji: '📏',
        descricao: 'Após identificar o dia do Pico, os próximos 3 dias são considerados parte do período fértil. A partir do 4º dia pós-pico começa a fase infértil pós-ovulatória.',
        dica: 'O app sinaliza automaticamente esses 3 dias com a cor laranja 🟠.',
      },
      {
        termo: 'Padrão Básico Infértil (PBI)', emoji: '📋',
        descricao: 'Padrão de dias secos ou de muco sem alteração que cada mulher aprende a identificar como seu padrão pessoal de infertilidade.',
        dica: 'O PBI é individual e estabelecido com ajuda de uma instrutora nos primeiros ciclos.',
      },
      {
        termo: 'Pico do Muco', emoji: '🎯',
        descricao: 'Último dia do muco escorregadio/filante antes de retornar ao padrão seco. Só é identificado com certeza no dia seguinte.',
        dica: 'Por isso é importante registrar todos os dias, sem pular.',
      },
    ],
  },
]

export default function HelpPage() {
  const [aberto, setAberto] = useState<string | null>(null)

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.voltarBtn}>← Voltar</Link>
        <h1 className={styles.titulo}>Glossário</h1>
        <div style={{ width: '4rem' }} />
      </header>

      <div className={styles.aviso}>
        <span>⚕️</span>
        <p>
          Este glossário é um guia de referência rápida. Para aprender o Método Billings
          com segurança, consulte sempre uma <strong>instrutora certificada da WOOMB Brasil</strong>.
        </p>
      </div>

      {SECOES.map(secao => (
        <div key={secao.titulo} className={styles.secao}>
          <h2 className={styles.secaoTitulo}>{secao.titulo}</h2>
          <div className={styles.card}>
            {secao.itens.map((item, idx) => {
              const id = `${secao.titulo}-${item.termo}`
              const estaAberto = aberto === id
              return (
                <div key={item.termo}
                  className={`${styles.item} ${idx < secao.itens.length - 1 ? styles.itemBorder : ''}`}>
                  <button
                    className={styles.itemHeader}
                    onClick={() => setAberto(estaAberto ? null : id)}
                  >
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <span className={styles.itemTermo}>{item.termo}</span>
                    <span className={`${styles.chevron} ${estaAberto ? styles.chevronAberto : ''}`}>›</span>
                  </button>
                  {estaAberto && (
                    <div className={styles.itemCorpo}>
                      <p className={styles.itemDesc}>{item.descricao}</p>
                      {item.dica && (
                        <div className={styles.itemDica}>
                          <span>💡</span> {item.dica}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className={styles.rodape}>
        <p>Dúvidas sobre o método?</p>
        <a href="https://woomb.org.br" target="_blank" rel="noopener noreferrer"
          className={styles.linkExterno}>
          Visitar WOOMB Brasil →
        </a>
      </div>
    </main>
  )
}
