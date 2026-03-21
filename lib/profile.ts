export type Tema = 'violeta' | 'rosa' | 'azul' | 'verde' | 'laranja' | 'teal'

export type Profile = {
  id?: string
  user_id: string
  nome: string
  tema: Tema
  onboarding_completo: boolean
  created_at?: string
  updated_at?: string
}

export const TEMAS: { valor: Tema; label: string; cor: string; emoji: string }[] = [
  { valor: 'violeta', label: 'Violeta',  cor: '#7c3aed', emoji: '💜' },
  { valor: 'rosa',    label: 'Rosa',     cor: '#db2777', emoji: '🩷' },
  { valor: 'azul',    label: 'Azul',     cor: '#2563eb', emoji: '💙' },
  { valor: 'verde',   label: 'Verde',    cor: '#16a34a', emoji: '💚' },
  { valor: 'laranja', label: 'Laranja',  cor: '#ea580c', emoji: '🧡' },
  { valor: 'teal',    label: 'Teal',     cor: '#0d9488', emoji: '🩵' },
]

/** Aplica o tema no <html> */
export function aplicarTema(tema: Tema) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', tema)
  }
}

/** Persiste tema localmente para aplicar antes do hydrate */
export function salvarTemaLocal(tema: Tema) {
  if (typeof localStorage !== 'undefined') localStorage.setItem('mob-tema', tema)
}

export function lerTemaLocal(): Tema {
  if (typeof localStorage === 'undefined') return 'violeta'
  return (localStorage.getItem('mob-tema') as Tema) ?? 'violeta'
}
