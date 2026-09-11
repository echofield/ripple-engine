import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F2',
        shadow: '#F5F3ED',
        ink: '#1A1A1A',
        emerald: '#10B981',
        'emerald-glow': 'rgba(16, 185, 129, 0.4)',
      },
      letterSpacing: {
        micro: '0.2em',
      },
      opacity: {
        ghost: '0.03',
        whisper: '0.08',
        present: '0.45',
      }
    }
  },
  plugins: [],
}
export default config
