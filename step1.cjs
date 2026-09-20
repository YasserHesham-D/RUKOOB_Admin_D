const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\yasser hesham\\Desktop\\Rukoob\\RUKOOBAPP\\RUKOOB_Admin_Dashboard';
const srcDir = path.join(targetDir, 'src');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(srcDir, 'api'));
ensureDir(path.join(srcDir, 'assets'));
ensureDir(path.join(srcDir, 'components', 'layout'));
ensureDir(path.join(srcDir, 'components', 'common'));
ensureDir(path.join(srcDir, 'components', 'map'));
ensureDir(path.join(srcDir, 'context'));
ensureDir(path.join(srcDir, 'pages'));
ensureDir(path.join(srcDir, 'types'));

// 1. Tailwind Config
fs.writeFileSync(path.join(targetDir, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rukoob: {
          bgDark: '#0B1411',
          bgDarkCard: '#12201B',
          bgDarkElevated: '#182C25',
          primary: '#132A20',
          primaryGreen: '#1B4D3E',
          emerald: '#10B981',
          gold: '#C5A880',
          goldLight: '#E8B923',
          goldAccent: '#D4AF37',
          navy: '#0C1814',
          surface: '#FFFFFF',
          surfaceAlt: '#F8FAF9',
          borderLight: '#E2E8E5',
          borderDark: '#233931',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
          textMuted: '#8C9B94',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
`);

// 2. PostCSS Config
fs.writeFileSync(path.join(targetDir, 'postcss.config.js'), `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`);

// 3. index.html
fs.writeFileSync(path.join(targetDir, 'index.html'), `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>رُكوب | لوحة تحكم الإدارة - RUKOOB Admin Portal</title>
    <!-- Google Fonts: Cairo & Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  </head>
  <body class="bg-rukoob-surfaceAlt dark:bg-rukoob-bgDark text-rukoob-textPrimary dark:text-gray-100 font-cairo antialiased selection:bg-rukoob-gold selection:text-rukoob-bgDark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

// 4. index.css
fs.writeFileSync(path.join(srcDir, 'index.css'), `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply transition-colors duration-200;
  }
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-700 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-600;
}

.leaflet-container {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  z-index: 10;
}
`);

console.log('Step 1 complete: Base configs and styles created.');
