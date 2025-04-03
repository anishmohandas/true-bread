/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm-serif': ['DM Serif Display', 'serif'],
        'libertinus': ['Libertinus', 'serif'],
        'primary': ['Cosi Times', 'serif'],
        'sans': ['sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'mango': ['MangoGrotesque', 'sans-serif'],
        'archivo-black': ['Archivo Black', 'sans-serif'],
        'cormorant': ['Cormorant SC', 'serif'],
        'spectral': ['Spectral', 'serif'],
        'mango-thin': ['MangoGrotesqueThin', 'sans-serif'],
        'mango-light': ['MangoGrotesqueLight', 'sans-serif'],
        'mango-medium': ['MangoGrotesqueMed', 'sans-serif'],
        'mango-semibold': ['MangoGrotesqueSemBd', 'sans-serif'],
        'mango-extrabold': ['MangoGrotesqueExtBd', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'mango-black': ['MangoGrotesqueBlack', 'sans-serif'],
        'migha': ['Migha Display', 'serif'],
        'manjari': ['Manjari', 'sans-serif'],
        'noto-sans-malayalam': ['Noto Sans Malayalam', 'sans-serif'],
        'helvetica': ['helvetica', 'sans-serif'],
        'helvetica-bold': ['helvetica-bold', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'butler-black': ['butler-black', 'sans-serif'],
        'butler-bold': ['butler-bold', 'sans-serif'],
        'butler-rmn': ['butler-rmn', 'sans-serif'],
        'noto-serif': ['Noto Serif', 'serif'],
        'clt-mattone': ['CLT Mattone', 'sans-serif'],
        'delight': ['Delight', 'sans-serif'],
        'delight-italic': ['Delight-Italic', 'sans-serif'],
        'delight-black': ['Delight-Black', 'sans-serif'],
      },
      colors: {
        'primary': '#000000',
        'secondary': '#ffffff',
        'warm-gray': '#f3f0ec',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      zIndex: {
        'preloader': '9999',
        'header': '1000',
      },
    },
  },
  plugins: [],
  important: true,
}







