/** @type {import('tailwindcss').Config} */
export default 
{
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",   // all your React files
  ],
  theme: 
  {
    extend: 
    {
      fontFamily: 
      {
        'times': ['Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
