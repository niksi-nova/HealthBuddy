/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary colors
                sage: {
                    DEFAULT: '#8B9D83',
                    light: '#A8B9A0',
                    dark: '#6E7F66',
                },
                terracotta: {
                    DEFAULT: '#D4A59A',
                    light: '#E6C4B8',
                    dark: '#C28D7E',
                },
                // Secondary colors
                sand: {
                    DEFAULT: '#F5F1E8',
                    light: '#FAF8F3',
                    dark: '#E8E2D5',
                },
                charcoal: {
                    DEFAULT: '#2D2D2D',
                    light: '#4A4A4A',
                    dark: '#1A1A1A',
                },
                // Accent
                gold: {
                    DEFAULT: '#E8B44F',
                    light: '#F2C976',
                    dark: '#D49F38',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                'card': '24px',
                'button': '16px',
                'input': '12px',
            },
            boxShadow: {
                'soft': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(232, 180, 79, 0.3)',
                'glow-sage': '0 0 20px rgba(139, 157, 131, 0.3)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            },
            backdropBlur: {
                'glass': '10px',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(232, 180, 79, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(232, 180, 79, 0.5)' },
                },
            },
        },
    },
    plugins: [],
}
