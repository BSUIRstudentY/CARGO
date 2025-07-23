/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Указывает на все файлы в src
  ],
  theme: {
    extend: {
      colors: {
        'custom-dark': 'var(--background-color, #2F2F2F)', // По умолчанию темно-серый
        'custom-accent': 'var(--accent-color, #FF5722)',   // По умолчанию оранжевый
      },
    },
  },
  plugins: [],
}