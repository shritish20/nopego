/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary:    "#ff6a00",
        background: "#000000",
        card:       "#111111",
        border:     "#222222",
        text:       "#ffffff",
        muted:      "#aaaaaa",
        brand: {
          // Backgrounds
          bg:             '#0A0A0A',
          card:           '#111111',
          border:         '#242424',
          // Orange primary (replaces all blue references)
          blue:           '#FF5A00',
          'blue-light':   '#FF7A30',
          // Dark orange accent (replaces navy)
          navy:           '#1A0800',
          'navy-dark':    '#120600',
          'navy-muted':   'rgba(255,90,0,0.15)',
          // Text
          white:          '#FFFFFF',
          muted:          '#A0A0A0',
          subtle:         '#666666',
          // Admin aliases
          black:          '#0A0A0A',
          'black-card':   '#111111',
          'black-border': '#242424',
          'gray-muted':   '#666666',
          'gray-text':    '#A0A0A0',
        },
        // Direct orange utilities
        orange: {
          brand:  '#FF5A00',
          light:  '#FF7A30',
          dark:   '#CC4800',
          glow:   'rgba(255,90,0,0.15)',
        },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        body:    ['var(--font-inter)', 'var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        marquee:               'marquee 25s linear infinite',
        'marquee-announcement':'marquee 30s linear infinite',
        'fade-up':             'fadeUp 0.6s ease forwards',
        'fade-in':             'fadeIn 0.4s ease forwards',
        'slide-in-right':      'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
