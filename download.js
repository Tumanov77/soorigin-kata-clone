const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const SITE_URL = 'https://sooriginkata.com';

function injectSEO(html) {
  html = html.replace(/<title>[^<]*<\/title>/i, '<title>SO Origin Kata \u041f\u0445\u0443\u043a\u0435\u0442 — \u041a\u0443\u043f\u0438\u0442\u044c \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0443 \u043e\u0442 99 900$ | \u0420\u044f\u0434\u043e\u043c \u0441 \u043f\u043b\u044f\u0436\u0435\u043c \u041a\u0430\u0442\u0430</title>');
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i, '<meta name="description" content="\u0416\u0438\u043b\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0441 SO Origin Kata \u0432 800\u043c \u043e\u0442 \u043f\u043b\u044f\u0436\u0430 \u041a\u0430\u0442\u0430. \u041a\u0432\u0430\u0440\u0442\u0438\u0440\u044b \u043e\u0442 99 900$. \u0414\u043e\u0445\u043e\u0434 7-15%. 686 \u044e\u043d\u0438\u0442\u043e\u0432. \u0421\u0434\u0430\u0447\u0430 Q4 2026."');
  html = html.replace(/<html/i, '<html lang="ru"');
  if (!html.includes('name="keywords"')) {
    html = html.replace('</head>', '<meta name="keywords" content="SO Origin Kata, \u041f\u0445\u0443\u043a\u0435\u0442, \u043a\u0443\u043f\u0438\u0442\u044c \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0443, \u043d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c \u041a\u0430\u0442\u0430, \u0438\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438">\n</head>');
  }
  const jsonLd = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"RealEstateListing","name":"SO Origin Kata Phuket","description":"Luxury condominium 800m from Kata Beach. From $99,900.","url":"https://sooriginkata.com","offers":{"@type":"Offer","priceCurrency":"USD","price":"99900"},"address":{"@type":"PostalAddress","addressLocality":"Karon","addressRegion":"Phuket","addressCountry":"TH"}}</script>';
  html = html.replace('</head>', jsonLd + '\n</head>');
  html = html.replace(/property="og:title"\s+content="[^"]*"/i, 'property="og:title" content="SO Origin Kata — \u041a\u0432\u0430\u0440\u0442\u0438\u0440\u044b \u043e\u0442 99 900$"');
  html = html.replace(/property="og:description"\s+content="[^"]*"/i, 'property="og:description" content="\u0416\u0438\u043b\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0441 \u043f\u0440\u0435\u043c\u0438\u0443\u043c-\u043a\u043b\u0430\u0441\u0441\u0430 \u0440\u044f\u0434\u043e\u043c \u0441 \u043f\u043b\u044f\u0436\u0435\u043c \u041a\u0430\u0442\u0430."');
  return html;
}

async function downloadSite() {
  console.log('Downloading ' + SITE_URL);
  try {
    const resp = await fetch(SITE_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html', 'Accept-Language': 'ru-RU,ru;q=0.9' }
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    let html = await resp.text();
    html = html.replace(/href="\/\//g, 'href="' + SITE_URL + '/');
    html = injectSEO(html);
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'index.html'), html);
    console.log('Saved with SEO (' + html.length + ' bytes)');
  } catch (err) { console.error('Failed:', err.message); process.exit(1); }
}
downloadSite();
