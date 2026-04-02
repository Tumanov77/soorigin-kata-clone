const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = 'https://sooriginkata.com';
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SEO improvements to inject into the HTML
function injectSEO(html) {
  // 1. Fix title
  html = html.replace(/<title>[^<]*<\/title>/i,
    '<title>SO Origin Kata \u041f\u0445\u0443\u043a\u0435\u0442 \u2014 \u041a\u0443\u043f\u0438\u0442\u044c \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0443 \u043e\u0442 99 900$ | \u0420\u044f\u0434\u043e\u043c \u0441 \u043f\u043b\u044f\u0436\u0435\u043c \u041a\u0430\u0442\u0430</title>');

  // 2. Fix meta description
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i,
    '<meta name="description" content="\u0416\u0438\u043b\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0441 SO Origin Kata \u0432 800\u043c \u043e\u0442 \u043f\u043b\u044f\u0436\u0430 \u041a\u0430\u0442\u0430, \u041f\u0445\u0443\u043a\u0435\u0442. \u041a\u0432\u0430\u0440\u0442\u0438\u0440\u044b \u043e\u0442 99 900$. \u0414\u043e\u0445\u043e\u0434 7-15% \u0433\u043e\u0434\u043e\u0432\u044b\u0445. 686 \u044e\u043d\u0438\u0442\u043e\u0432, 4 \u0437\u0434\u0430\u043d\u0438\u044f. \u0421\u0434\u0430\u0447\u0430 Q4 2026."');

  // 3. Add lang="ru" to html tag
  html = html.replace(/<html/i, '<html lang="ru"');

  // 4. Add meta keywords
  if (!html.includes('name="keywords"')) {
    html = html.replace('</head>',
      '<meta name="keywords" content="SO Origin Kata, \u041f\u0445\u0443\u043a\u0435\u0442, \u043a\u0443\u043f\u0438\u0442\u044c \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0443, \u043d\u0435\u0434\u0432\u0438\u0436\u0438\u043c\u043e\u0441\u0442\u044c \u041a\u0430\u0442\u0430, \u0438\u043d\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \u0422\u0430\u0439\u043b\u0430\u043d\u0434, Origin Property, \u043a\u043e\u043d\u0434\u043e\u043c\u0438\u043d\u0438\u0443\u043c \u041f\u0445\u0443\u043a\u0435\u0442">\n</head>');
  }

  // 5. Add JSON-LD structured data
  const jsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "SO Origin Kata Phuket",
  "description": "Luxury condominium complex 800m from Kata Beach, Phuket. 686 units in 4 buildings. Starting from $99,900. Rental yield 7-15%.",
  "url": "https://sooriginkata.com",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "99900",
    "availability": "https://schema.org/PreSale"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Karon",
    "addressRegion": "Phuket",
    "addressCountry": "TH"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "7.8432",
    "longitude": "98.2989"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Tumanov Group",
  "url": "https://tumanov.group",
  "description": "Investment consulting for Phuket real estate"
}
</script>`;

  html = html.replace('</head>', jsonLd + '\n</head>');

  // 6. Fix OG tags
  html = html.replace(/property="og:title"\s+content="[^"]*"/i,
    'property="og:title" content="SO Origin Kata \u041f\u0445\u0443\u043a\u0435\u0442 \u2014 \u041a\u0432\u0430\u0440\u0442\u0438\u0440\u044b \u043e\u0442 99 900$"');
  html = html.replace(/property="og:description"\s+content="[^"]*"/i,
    'property="og:description" content="\u0416\u0438\u043b\u043e\u0439 \u043a\u043e\u043c\u043f\u043b\u0435\u043a\u0441 \u043f\u0440\u0435\u043c\u0438\u0443\u043c-\u043a\u043b\u0430\u0441\u0441\u0430 \u0440\u044f\u0434\u043e\u043c \u0441 \u043f\u043b\u044f\u0436\u0435\u043c \u041a\u0430\u0442\u0430. 686 \u044e\u043d\u0438\u0442\u043e\u0432, \u0434\u043e\u0445\u043e\u0434 7-15%."');

  return html;
}

async function ensureContent() {
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('No cached content, downloading...');
    try {
      const resp = await fetch(SITE_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      if (resp.ok) {
        let html = await resp.text();
        html = html.replace(/href="\/\//g, 'href="' + SITE_URL + '/');
        html = injectSEO(html);
        fs.writeFileSync(indexPath, html);
        console.log('Cached index.html with SEO improvements (' + html.length + ' bytes)');
      }
    } catch (err) {
      console.error('Failed to download:', err.message);
    }
  } else {
    console.log('Using cached content');
  }
}

app.use(express.static(publicDir));

app.get('/privacy', async (req, res) => {
  const privPath = path.join(publicDir, 'privacy.html');
  if (fs.existsSync(privPath)) {
    return res.sendFile(privPath);
  }
  try {
    const resp = await fetch(SITE_URL + '/privacy', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
    });
    const html = await resp.text();
    fs.writeFileSync(privPath, html);
    res.send(html);
  } catch (err) {
    res.status(502).send('Page not available');
  }
});

app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Content not yet cached. Please try again in a moment.');
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

ensureContent().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on port ' + PORT);
  });
});
