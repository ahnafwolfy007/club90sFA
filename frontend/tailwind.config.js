// ==================================================
// PREMIUM GOLD THEME CONFIGURATION
// ==================================================

// tailwind.config.js - Complete Premium Configuration
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFFEF7',
          100: '#FFFBEB',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#FFD700', // Main shiny gold
          light: '#FFF8DC', // Light gold for text
          dark: '#B8860B', // Dark gold for borders
        },
        dark: {
          50: '#F7F7F7',
          100: '#E1E1E1',
          200: '#CFCFCF',
          300: '#B1B1B1',
          400: '#9E9E9E',
          500: '#6D6D6D',
          600: '#5D5D5D',
          700: '#4F4F4F',
          800: '#454545',
          900: '#3D3D3D',
          950: '#1A1A1A', // Main dark background
          card: '#252525', // Card backgrounds
          border: '#333333', // Border color
        },
        accent: {
          rose: '#E8B4B8',
          bronze: '#CD7F32',
          champagne: '#F7E7CE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        // Entrance animations
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        
        // Gold-specific animations
        'gold-shimmer': 'goldShimmer 2s ease-in-out infinite',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite',
        'gold-glow': 'goldGlow 3s ease-in-out infinite',
        'gold-rotate': 'goldRotate 10s linear infinite',
        
        // Interactive animations
        'bounce-gentle': 'bounceGentle 1s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        
        // Loading animations
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        
        // Scroll animations
        'parallax-slow': 'parallaxSlow 20s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite alternate',
      },
      keyframes: {
        // Entrance keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        
        // Gold-specific keyframes
        goldShimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: '200px 0' },
        },
        goldPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)',
            transform: 'scale(1)' 
          },
          '50%': { 
            boxShadow: '0 0 20px 10px rgba(255, 215, 0, 0)',
            transform: 'scale(1.05)' 
          },
        },
        goldGlow: {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))' 
          },
          '50%': { 
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' 
          },
        },
        goldRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        
        // Interactive keyframes
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-15px,0)' },
          '70%': { transform: 'translate3d(0,-7px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        wiggle: {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        
        // Scroll keyframes
        parallaxSlow: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drift: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        // Gold shadows
        'gold-sm': '0 1px 2px 0 rgba(255, 215, 0, 0.05)',
        'gold': '0 1px 3px 0 rgba(255, 215, 0, 0.1), 0 1px 2px 0 rgba(255, 215, 0, 0.06)',
        'gold-md': '0 4px 6px -1px rgba(255, 215, 0, 0.1), 0 2px 4px -1px rgba(255, 215, 0, 0.06)',
        'gold-lg': '0 10px 15px -3px rgba(255, 215, 0, 0.1), 0 4px 6px -2px rgba(255, 215, 0, 0.05)',
        'gold-xl': '0 20px 25px -5px rgba(255, 215, 0, 0.1), 0 10px 10px -5px rgba(255, 215, 0, 0.04)',
        'gold-2xl': '0 25px 50px -12px rgba(255, 215, 0, 0.25)',
        'gold-inner': 'inset 0 2px 4px 0 rgba(255, 215, 0, 0.06)',
        
        // Dark shadows with gold accents
        'dark-gold': '0 4px 14px 0 rgba(0, 0, 0, 0.39), 0 0 0 1px rgba(255, 215, 0, 0.1)',
        'dark-gold-lg': '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 215, 0, 0.2)',
        
        // Glow effects
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.6)',
        'glow-gold-lg': '0 0 40px rgba(255, 215, 0, 0.4)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
        'gold-gradient-radial': 'radial-gradient(circle, #FFD700 0%, #DAA520 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 50%, #1A1A1A 100%)',
        'dark-gradient-radial': 'radial-gradient(circle, #2D2D2D 0%, #1A1A1A 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.05"/%3E%3C/svg%3E")',
      },
      gradientColorStops: {
        'gold-stop-1': '#FFD700',
        'gold-stop-2': '#FFA500',
        'gold-stop-3': '#FF8C00',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Custom plugin for additional utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.text-shadow-gold': {
          textShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
        },
        '.text-shadow-gold-lg': {
          textShadow: '0 4px 8px rgba(255, 215, 0, 0.5)',
        },
        '.backdrop-blur-gold': {
          backdropFilter: 'blur(8px) saturate(180%)',
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
        },
        '.glass-gold': {
          background: 'rgba(255, 215, 0, 0.1)',
          backdropFilter: 'blur(10px) saturate(180%)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px) saturate(180%)',
          border: '1px solid rgba(255, 215, 0, 0.1)',
        },
        '.scrollbar-hidden': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-gold': {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(26, 26, 26, 0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #FFD700, #FFA500)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(180deg, #FFA500, #FFD700)',
          },
        },
      }

      const newComponents = {
        '.btn-gold': {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          color: '#1A1A1A',
          fontWeight: '600',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)',
          },
          '&:hover:before': {
            left: '100%',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.btn-gold-outline': {
          background: 'transparent',
          color: '#FFD700',
          fontWeight: '600',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          border: '2px solid #FFD700',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '0%',
            height: '100%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            transition: 'width 0.3s ease',
            zIndex: '-1',
          },
          '&:hover': {
            color: '#1A1A1A',
            borderColor: '#FFA500',
          },
          '&:hover:before': {
            width: '100%',
          },
        },
        '.card-gold': {
          background: 'rgba(37, 37, 37, 0.9)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '1rem',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(255, 215, 0, 0.4)',
            boxShadow: '0 10px 40px rgba(255, 215, 0, 0.1)',
            transform: 'translateY(-4px)',
          },
        },
        '.input-gold': {
          background: 'rgba(37, 37, 37, 0.8)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          color: '#F5F5F5',
          transition: 'all 0.3s ease',
          '&:focus': {
            outline: 'none',
            borderColor: '#FFD700',
            boxShadow: '0 0 0 3px rgba(255, 215, 0, 0.1)',
            background: 'rgba(37, 37, 37, 1)',
          },
          '&::placeholder': {
            color: 'rgba(245, 245, 245, 0.5)',
          },
        },
        
        // Additional gradient utilities
        '.bg-green-gradient': {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
        },
        '.bg-red-gradient': {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}