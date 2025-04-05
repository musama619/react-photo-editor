/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      rotate: {
        45: '45deg',
        90: '90deg',
        135: '135deg',
        180: '180deg',
      },
      brightness: {
        25: '.25',
        175: '1.75',
      },
      contrast: {
        25: '.25',
        175: '1.75',
      },
      saturate: {
        25: '.25',
        75: '.75',
        125: '1.25',
        175: '1.75',
      },
      width: {
        30: '30rem',
      },
    },
  },
  plugins: [],
  prefix: 'rpe-',
};
