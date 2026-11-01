/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        outline: 'hsl(var(--outline))',
        outlineVariant: 'hsl(var(--outline-variant))',
        surface: 'hsl(var(--surface))',
        surfaceVariant: 'hsl(var(--surface-variant))',
        onSurface: 'hsl(var(--on-surface))',
        onSurfaceVariant: 'hsl(var(--on-surface-variant))',
        surfaceContainerLowest: 'hsl(var(--surface-container-lowest))',
        surfaceContainerLow: 'hsl(var(--surface-container-low))',
        surfaceContainer: 'hsl(var(--surface-container))',
        surfaceContainerHigh: 'hsl(var(--surface-container-high))',
        surfaceContainerHighest: 'hsl(var(--surface-container-highest))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        primaryContainer: 'hsl(var(--primary-container))',
        onPrimaryContainer: 'hsl(var(--on-primary-container))',
        secondaryContainer: 'hsl(var(--secondary-container))',
        onSecondaryContainer: 'hsl(var(--on-secondary-container))',
        tertiary: {
          DEFAULT: 'hsl(var(--tertiary))',
          foreground: 'hsl(var(--on-tertiary))',
        },
        tertiaryContainer: 'hsl(var(--tertiary-container))',
        onTertiaryContainer: 'hsl(var(--on-tertiary-container))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        errorContainer: 'hsl(var(--error-container))',
        onErrorContainer: 'hsl(var(--on-error-container))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        inverseSurface: 'hsl(var(--inverse-surface))',
        inverseOnSurface: 'hsl(var(--inverse-on-surface))',
        inversePrimary: 'hsl(var(--inverse-primary))',
        success: 'hsl(var(--success))',
      },
    },
  },
  plugins: [],
};
