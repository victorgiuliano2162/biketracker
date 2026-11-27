export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface DifficultyOption {
  value: string;
  label: string;
}

export interface DifficultyMeta {
  label: string;
  color: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Países Baixos', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'ZA', name: 'África do Sul', flag: '🇿🇦' },
  { code: 'OTHER', name: 'Outro', flag: '🌍' },
];

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { value: 'FACIL', label: 'Fácil' },
  { value: 'MODERADA', label: 'Moderada' },
  { value: 'DIFICIL', label: 'Difícil' },
];

export const DIFFICULTY_LABELS: Record<string, DifficultyMeta> = {
  EASY: { label: 'Fácil', color: '#4caf50' },
  FACIL: { label: 'Fácil', color: '#4caf50' },
  MODERATE: { label: 'Moderado', color: '#ff9800' },
  MODERADA: { label: 'Moderada', color: '#ff9800' },
  HARD: { label: 'Difícil', color: '#f44336' },
  DIFICIL: { label: 'Difícil', color: '#f44336' },
  EXPERT: { label: 'Expert', color: '#9c27b0' },
};

export const GPX_COLORS = [
  '#e53935',
  '#8e24aa',
  '#1e88e5',
  '#00897b',
  '#f4511e',
  '#6d4c41',
  '#00acc1',
  '#43a047',
];
