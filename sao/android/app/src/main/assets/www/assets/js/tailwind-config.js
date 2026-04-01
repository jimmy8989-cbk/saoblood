tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
                serif: ['Playfair Display', 'serif'],
            },
            animation: {
                'vibe-shift': 'vibeShift 0.5s ease-out forwards',
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                vibeShift: {
                    '0%': { filter: 'brightness(2) hue-rotate(90deg)' },
                    '100%': { filter: 'brightness(1) hue-rotate(0deg)' }
                }
            }
        }
    }
};