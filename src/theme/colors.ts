export const colors = {
  primary: '#8B5CF6', // Purple
  secondary: '#EC4899', // Hot Pink
  accent: '#06B6D4', // Turquoise
  success: '#10B981', // Green
  warning: '#F59E0B', // Orange
  error: '#EF4444', // Red
  background: {
    dark: '#1F2937',
    darker: '#111827',
    light: '#F3F4F6',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    dark: '#111827',
  },
  border: {
    light: '#374151',
    dark: '#1F2937',
  },
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const gradients = {
  primary: ['#8B5CF6', '#6366F1'],
  secondary: ['#EC4899', '#F472B6'],
  dark: ['#111827', '#1F2937'],
} as const;

export type ColorTheme = typeof colors;
export type GradientTheme = typeof gradients; 