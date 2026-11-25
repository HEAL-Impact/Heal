// Heal Theme Configuration
// Based on the signin/signup pages color palette

export const healTheme = {
  colors: {
    // Primary colors from auth pages
    cream: '#ECE5DA',
    sage: '#2C4A4E', 
    darkTeal: '#2C4A4E',
    mediumTeal: '#2C4A4E',
    lightTeal: '#2C4A4E',
    beige: '#C2BCAE',
    lightBlue: '#EAEDED',
    accentBlue: '#2C4A4E',
    lightGray: '#B0BEC0',
    offWhite: '#ECE5DA',
    warmWhite: '#ECE5DA',
  },
  
  // CSS custom properties for dynamic theming
  cssVars: {
    '--heal-cream': '#ECE5DA',
    '--heal-sage': '#2C4A4E',
    '--heal-dark-teal': '#2C4A4E',
    '--heal-medium-teal': '#2C4A4E',
    '--heal-light-teal': '#2C4A4E',
    '--heal-beige': '#C2BCAE',
    '--heal-light-blue': '#EAEDED',
    '--heal-accent-blue': '#2C4A4E',
    '--heal-light-gray': '#B0BEC0',
    '--heal-off-white': '#ECE5DA',
    '--heal-warm-white': '#ECE5DA',
  },
  
  // Semantic color mappings
  semantic: {
    primary: '#2C4A4E',
    secondary: '#2C4A4E',
    accent: '#2C4A4E',
    background: '#ECE5DA',
    surface: '#FFFFFF',
    text: {
      primary: '#2C4A4E',
      secondary: '#2C4A4E',
      accent: '#2C4A4E',
      light: '#ECE5DA',
    },
    status: {
      success: '#2C4A4E',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#2C4A4E',
    }
  },
  
  // Component-specific styles
  components: {
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(194, 188, 174, 0.5)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    button: {
      primary: {
        background: '#2C4A4E',
        color: '#ECE5DA',
        hover: '#2C4A4E',
      },
      secondary: {
        background: 'transparent',
        color: '#2C4A4E',
        border: '#ECE5DA',
        hover: {
          background: '#2C4A4E',
          color: '#ECE5DA',
        }
      }
    },
    input: {
      background: 'transparent',
      border: '#ECE5DA',
      color: '#ECE5DA',
      placeholder: '#ECE5DA',
      focus: '#ECE5DA',
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      accent: 'Inter, sans-serif', // Using Inter for consistency
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    }
  },
  
  // Spacing and layout
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    full: '9999px',
  }
} as const;

// Helper functions for theme usage
export const getThemeColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: any = healTheme;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return null;
  }
  
  return value;
};

// CSS-in-JS helper for inline styles
export const themeStyle = (styles: Record<string, string>) => {
  const processedStyles: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (value.startsWith('var(--heal-')) {
      processedStyles[key] = value;
    } else if (value.startsWith('heal.')) {
      const themeValue = getThemeColor(value.replace('heal.', ''));
      processedStyles[key] = themeValue || value;
    } else {
      processedStyles[key] = value;
    }
  }
  
  return processedStyles;
};

export default healTheme;