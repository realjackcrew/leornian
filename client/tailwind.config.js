export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    safelist: [
      'dark:bg-gray-900',
      'dark:bg-gray-800', 
      'dark:bg-gray-700',
      'dark:text-white',
      'dark:text-gray-200',
      'dark:text-gray-300',
      'dark:border-gray-700',
      'dark:border-gray-600',
      'dark:bg-blue-900',
      'dark:bg-green-900',
      'dark:bg-red-900',
      'dark:bg-purple-900',
      'dark:text-blue-100',
      'dark:text-green-100',
      'dark:text-red-100',
      'dark:text-purple-100',
    ],
    theme: {
      extend: {
        colors: {
          light: '#eef3f7',
          dark: '#2c333a',
        },
        fontFamily: {
          sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        },
        animation: {
          // 'infinite-scroll': 'infinite-scroll 25s linear infinite',
          'gradient-xy': 'gradient-xy 15s ease infinite',
          'gradient-xy-reverse': 'gradient-xy-reverse 15s ease infinite',
          'marquee': 'marquee 300s linear infinite',
        },
        keyframes: {
          // 'infinite-scroll': {
          //   '0%': { transform: 'translateX(0)' },
          //   '100%': { transform: 'translateX(calc(-50% - 1rem))' },
          // },
          'gradient-xy': {
            '0%, 100%': {
              'background-size': '400% 400%',
              'background-position': 'left center'
            },
            '50%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            }
          },
          'gradient-xy-reverse': {
            '0%, 100%': {
              'background-size': '200% 200%',
              'background-position': 'right center'
            },
            '50%': {
              'background-size': '400% 400%',
              'background-position': 'left center'
            }
          },
          marquee: {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-100%)' },
          },
        },
      },
    },
    plugins: [],
  };

  