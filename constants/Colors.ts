const Colors = {
  primary: '#6366f1', // Indigo moderne
  primaryLight: '#818cf8',
  primaryDark: '#4338ca',
  
  secondary: '#8b5cf6', // Violet élégant
  secondaryLight: '#a78bfa',
  secondaryDark: '#7c3aed',
  
  accent: '#06b6d4', // Cyan vibrant
  accentLight: '#67e8f9',
  accentDark: '#0891b2',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Thème clair moderne - MODIFIÉ POUR EXPO
  backgroundLight: '#f8fafc', // Changé de blanc pur à gris très clair
  backgroundMedium: '#f1f5f9', // Gris clair
  backgroundDark: '#e2e8f0', // Gris plus foncé
  
  // Surfaces avec glassmorphism - MODIFIÉ POUR EXPO
  surface: '#f8fafc', // Couleur solide au lieu de rgba
  surfaceGlass: '#f1f5f9', // Couleur solide au lieu de rgba
  surfaceDark: '#e2e8f0', // Couleur solide au lieu de rgba
  
  white: '#ffffff',
  black: '#000000',
  
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  text: {
    primary: '#0f172a', // Texte sombre sur fond clair
    secondary: 'rgba(15, 23, 42, 0.7)', // Texte secondaire
    disabled: 'rgba(15, 23, 42, 0.4)',
    hint: 'rgba(15, 23, 42, 0.5)',
    light: '#ffffff', // Pour texte sur fond sombre
  },
  
  dream: {
    joy: '#fbbf24', // Ambre chaleureux
    sadness: '#3b82f6', // Bleu profond
    fear: '#8b5cf6', // Violet mystérieux
    anger: '#ef4444', // Rouge intense
    confusion: '#f97316', // Orange vif
    neutral: '#6b7280', // Gris neutre
  },
  
  // Gradients modernes
  gradients: {
    primary: ['#6366f1', '#8b5cf6'],
    secondary: ['#8b5cf6', '#06b6d4'],
    warm: ['#f59e0b', '#ef4444'],
    cool: ['#06b6d4', '#3b82f6'],
    light: ['#f8fafc', '#f1f5f9'], // Modifié pour Expo
    glass: ['#f8fafc', '#f1f5f9'], // Modifié pour Expo
  },
  
  // Ombres modernes
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  transparent: 'transparent',
};

export default Colors;