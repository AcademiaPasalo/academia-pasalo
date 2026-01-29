/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== ALIASES PRINCIPALES (nivel raíz para usar como text-X, bg-X, border-X) =====
        
        // Alias de color principal
        main: "var(--deep-blue-800)",
        "main-color": "var(--main-color-main-color)",

        // Aliases semánticos de texto
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        
        // Aliases semánticos de background (para usar bg-X directamente)
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "bg-primary-hover": "var(--bg-primary-hover)",
        "bg-secondary-hover": "var(--bg-secondary-hover)",
        "bg-tertiary-hover": "var(--bg-tertiary-hover)",
        "primary-hover": "var(--bg-primary-hover)",
        "secondary-hover": "var(--bg-secondary-hover)",
        "tertiary-hover": "var(--bg-tertiary-hover)",
        
        // Aliases de accent (texto y fondo)
        "accent-primary": "var(--text-accent-primary)",
        "accent-primary-hover": "var(--text-accent-primary-hover)",
        "accent-primary-pressed": "var(--text-accent-primary-pressed)",
        "accent-secondary": "var(--text-accent-secondary)",
        "accent-secondary-hover": "var(--text-accent-secondary-hover)",
        "accent-secondary-pressed": "var(--text-accent-secondary-pressed)",
        "accent-solid": "var(--bg-accent-solid)",
        "accent-solid-hover": "var(--bg-accent-solid-hover)",
        "accent-solid-pressed": "var(--bg-accent-solid-pressed)",
        "accent-light": "var(--bg-accent-light)",
        "accent-light-hover": "var(--bg-accent-light-hover)",
        "accent-light-pressed": "var(--bg-accent-light-pressed)",

        // Aliases de estados (error, success, warning, info)
        "error-solid": "var(--bg-error-solid)",
        "error-light": "var(--bg-error-light)",
        "success-solid": "var(--bg-success-solid)",
        "success-light": "var(--bg-success-light)",
        "warning-solid": "var(--bg-warning-solid)",
        "warning-light": "var(--bg-warning-light)",
        "info-primary-solid": "var(--bg-info-primary-solid)",
        "info-secondary-solid": "var(--bg-info-secondary-solid)",

        // Base colors
        base: {
          white: "var(--base-white)",
          black: "var(--base-black)",
          transparent: "var(--base-transparent)",
        },

        // Deep Blue (Color principal del diseño)
        "deep-blue": {
          50: "var(--deep-blue-50)",
          100: "var(--deep-blue-100)",
          200: "var(--deep-blue-200)",
          300: "var(--deep-blue-300)",
          400: "var(--deep-blue-400)",
          500: "var(--deep-blue-500)",
          600: "var(--deep-blue-600)",
          700: "var(--deep-blue-700)",
          800: "var(--deep-blue-800)",
          900: "var(--deep-blue-900)",
        },

        // Muted Indigo (Color secundario)
        "muted-indigo": {
          50: "var(--muted-indigo-50)",
          100: "var(--muted-indigo-100)",
          200: "var(--muted-indigo-200)",
          300: "var(--muted-indigo-300)",
          400: "var(--muted-indigo-400)",
          500: "var(--muted-indigo-500)",
          600: "var(--muted-indigo-600)",
          700: "var(--muted-indigo-700)",
          800: "var(--muted-indigo-800)",
          900: "var(--muted-indigo-900)",
        },

        // Magenta Violet
        "magenta-violet": {
          50: "var(--magenta-violet-50)",
          100: "var(--magenta-violet-100)",
          200: "var(--magenta-violet-200)",
          300: "var(--magenta-violet-300)",
          400: "var(--magenta-violet-400)",
          500: "var(--magenta-violet-500)",
          600: "var(--magenta-violet-600)",
          700: "var(--magenta-violet-700)",
          800: "var(--magenta-violet-800)",
          900: "var(--magenta-violet-900)",
        },

        // Gray scale
        gray: {
          50: "var(--gray-50)",
          100: "var(--gray-100)",
          200: "var(--gray-200)",
          300: "var(--gray-300)",
          400: "var(--gray-400)",
          500: "var(--gray-500)",
          600: "var(--gray-600)",
          700: "var(--gray-700)",
          800: "var(--gray-800)",
          900: "var(--gray-900)",
        },

        // Semantic colors - Background
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          tertiary: "var(--bg-tertiary)",
          "accent-solid": "var(--bg-accent-solid)",
          "accent-solid-hover": "var(--bg-accent-solid-hover)",
          "accent-light": "var(--bg-accent-light)",
          "error-solid": "var(--bg-error-solid)",
          "success-solid": "var(--bg-success-solid)",
          "warning-solid": "var(--bg-warning-solid)",
          disabled: "var(--bg-disabled)",
        },

        // Semantic colors - Text
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          "accent-primary": "var(--text-accent-primary)",
          "accent-primary-hover": "var(--text-accent-primary-hover)",
          white: "var(--text-white)",
          disabled: "var(--text-disabled)",
          placeholder: "var(--text-placeholder)",
          "error-primary": "var(--text-error-primary)",
          "success-primary": "var(--text-success-primary)",
          "warning-primary": "var(--text-warning-primary)",
        },

        // Semantic colors - Stroke/Border
        stroke: {
          primary: "var(--stroke-primary)",
          secondary: "var(--stroke-secondary)",
          "accent-primary": "var(--stroke-accent-primary)",
          "accent-secondary": "var(--stroke-accent-secondary)",
          white: "var(--stroke-white)",
          disabled: "var(--stroke-disabled)",
        },

        // Semantic colors - Icon
        icon: {
          primary: "var(--icon-primary)",
          secondary: "var(--icon-secondary)",
          tertiary: "var(--icon-tertiary)",
          "accent-primary": "var(--icon-accent-primary)",
          white: "var(--icon-white)",
          disabled: "var(--icon-disabled)",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      backgroundColor: {
        DEFAULT: "var(--bg-primary)",
      },
      textColor: {
        DEFAULT: "var(--text-primary)",
      },
      borderColor: {
        DEFAULT: "var(--stroke-primary)",
      },
    },
  },
  plugins: [],
};
