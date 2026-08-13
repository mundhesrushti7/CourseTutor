/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          'surface-subtle': 'var(--surface-subtle)',
          border: 'var(--border)',
          'border-subtle': 'var(--border-subtle)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
          accent: 'var(--accent)',
          'accent-bg': 'var(--accent-bg)',
          'accent-border': 'var(--accent-border)',
          'accent-text': 'var(--accent-text)',
          header: 'var(--header-bg)',
          'header-border': 'var(--header-border)',
          'user-bg': 'var(--user-bubble-bg)',
          'user-text': 'var(--user-bubble-text)',
          'user-border': 'var(--user-bubble-border)',
          'tutor-bg': 'var(--tutor-bubble-bg)',
          'tutor-text': 'var(--tutor-bubble-text)',
          'tutor-border': 'var(--tutor-bubble-border)',
          'input-bg': 'var(--input-bg)',
          'input-border': 'var(--input-border)',
          'code-bg': 'var(--code-bg)',
          'code-border': 'var(--code-border)',
          'code-text': 'var(--code-text)',
        },
        concept: {
          confident: 'var(--concept-confident)',
          'confident-bg': 'var(--concept-confident-bg)',
          learning: 'var(--concept-learning)',
          'learning-bg': 'var(--concept-learning-bg)',
          'needs-revision': 'var(--concept-needs-revision)',
          'needs-revision-bg': 'var(--concept-needs-revision-bg)',
          unexplored: 'var(--concept-unexplored)',
          'unexplored-bg': 'var(--concept-unexplored-bg)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
