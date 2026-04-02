const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPPORTED_LANGS = ['ru', 'en'];
const DEFAULT_LANG = 'ru';

app.use(cookieParser());

// ======== LANGUAGE SWITCHER UI (injected into every page) ========
function getLanguageSwitcherHTML(currentLang) {
  const flags = { ru: '🇷🇺', en: '🇬🇧' };
  const labels = { ru: 'RU', en: 'EN' };

  const options = SUPPORTED_LANGS.map(lang => {
    const isActive = lang === currentLang;
    return `<a href="/${lang}/" class="lang-opt${isActive ? ' active' : ''}" data-lang="${lang}">${flags[lang]} ${labels[lang]}</a>`;
  }).join('');

  return `
<style>
  .lang-switcher {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 99999;
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .lang-opt {
    padding: 6px 12px;
    border-radius: 20px;
    text-decoration: none;
    color: #333;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .lang-opt:hover { background: #f0f0f0; }
  .lang-opt.active {
    background: #0088CC;
    color: white;
  }
  @media (max-width: 480px) {
    .lang-switcher { top: 10px; right: 10px; }
    .lang-opt { padding: 5px 8px; font-size: 12px; }
  }
</style>
<div class="lang-switcher">${options}</div>
<script>
  document.querySelectorAll('.lang-opt').forEach(function(el) {
    el.addEventListener('click', function(e) {
      document.cookie = 'lang=' + this.dataset.lang + ';path=/;max-age=31536000';
    });
  });
</script>`;
}

// ======== DETECT PREFERRED LANGUAGE ========
function detectLanguage(req) {
  // 1. URL path already specifies language
  const pathLang = req.path.split('/')[1];
  if (SUPPORTED_LANGS.includes(pathLang)) return pathLang;

  // 2. Cookie preference
  if (req.cookies.lang && SUPPORTED_LANGS.includes(req.cookies.lang)) return req.cookies.lang;

  // 3. Accept-Language header
  const acceptLang = req.headers['accept-language'] || '';
  const browserLangs = acceptLang.split(',').map(l => l.split(';')[0].trim().substring(0, 2).toLowerCase());
  for (const bl of browserLangs) {
    if (SUPPORTED_LANGS.includes(bl)) return bl;
  }

  return DEFAULT_LANG;
}

// ======== ROOT: auto-redirect to detected language ========
app.get('/', (req, res) => {
  const lang = detectLanguage(req);
  res.redirect(302, `/${lang}/`);
});

// ======== SERVE LANGUAGE PAGES ========
SUPPORTED_LANGS.forEach(lang => {
  app.get(`/${lang}/`, (req, res) => {
    const filePath = path.join(__dirname, 'public', lang, 'index.html');
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Language version not found');
    }

    let html = fs.readFileSync(filePath, 'utf-8');

    // Inject language switcher before </body>
    const switcher = getLanguageSwitcherHTML(lang);
    html = html.replace('</body>', `${switcher}\n</body>`);

    // Set cookie
    res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000, path: '/' });
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  // Serve any sub-paths under language prefix (for assets etc.)
  app.get(`/${lang}/*`, (req, res, next) => {
    const subPath = req.path.replace(`/${lang}`, '');
    // Try to serve from public root (assets are shared)
    const filePath = path.join(__dirname, 'public', subPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    next();
  });
});

// ======== PRIVACY POLICY ========
app.get('/privacy', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>Privacy Policy — SO Origin Kata</title></head>
<body style="max-width:800px;margin:40px auto;padding:20px;font-family:sans-serif;">
<h1>Privacy Policy</h1><p>This clone site does not collect personal data. All form submissions are handled by the original site sooriginkata.com.</p>
<p><a href="/">← Back to site</a></p></body></html>`);
});

// ======== FALLBACK: redirect unknown paths to root ========
app.use((req, res) => {
  // If requesting a file (has extension), try public folder
  if (path.extname(req.path)) {
    const filePath = path.join(__dirname, 'public', req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  res.redirect(302, '/');
});

app.listen(PORT, () => {
  console.log(`SO Origin Kata (multilingual) running on port ${PORT}`);
  console.log(`Languages: ${SUPPORTED_LANGS.join(', ')}`);
});
