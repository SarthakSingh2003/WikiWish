/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
        },
        border: {
          DEFAULT: 'var(--border-app)',
          subtle: 'var(--border-subtle)',
          hover: 'var(--border-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        brand: {
          DEFAULT: 'var(--accent-brand)',
          hover: 'var(--accent-brand-hover)',
          subtle: 'var(--accent-brand-subtle)',
          border: 'var(--accent-brand-border)',
          text: 'var(--accent-brand-text)',
        },
        status: {
          review: {
            bg: 'var(--status-review-bg)',
            text: 'var(--status-review-text)',
            border: 'var(--status-review-border)',
          },
          completed: {
            bg: 'var(--status-completed-bg)',
            text: 'var(--status-completed-text)',
            border: 'var(--status-completed-border)',
          },
          declined: {
            bg: 'var(--status-declined-bg)',
            text: 'var(--status-declined-text)',
            border: 'var(--status-declined-border)',
          },
          clarify: {
            bg: 'var(--status-clarify-bg)',
            text: 'var(--status-clarify-text)',
            border: 'var(--status-clarify-border)',
          },
          opportunity: {
            bg: 'var(--status-opportunity-bg)',
            text: 'var(--status-opportunity-text)',
            border: 'var(--status-opportunity-border)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
