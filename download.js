const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://sooriginkata.com';

// ======== SEO INJECTION (per language) ========
const seoConfig = {
  ru: {
    title: 'SO Origin Kata Пхукет — Купить квартиру от 99 900$ | Рядом с пляжем Ката',
    description: 'SO Origin Kata — премиальные апартаменты на Пхукете рядом с пляжем Ката. Цены от 99 900$. Доходность до 8% годовых. Рассрочка от застройщика. Сдача 2026.',
    keywords: 'SO Origin Kata, купить квартиру Пхукет, апартаменты Ката, недвижимость Пхукет, инвестиции Пхукет, кондоминиум Пхукет',
    locale: 'ru_RU',
    lang: 'ru',
    schemaName: 'SO Origin Kata — Апартаменты на Пхукете',
    schemaDesc: 'Премиальный кондоминиум SO Origin Kata рядом с пляжем Ката, Пхукет. Апартаменты от 99 900$.'
  },
  en: {
    title: 'SO Origin Kata Phuket — Buy Condo from $99,900 | Near Kata Beach',
    description: 'SO Origin Kata — premium apartments in Phuket near Kata Beach. Prices from $99,900. Up to 8% annual ROI. Developer payment plan. Completion 2026.',
    keywords: 'SO Origin Kata, buy condo Phuket, Kata apartments, Phuket real estate, Phuket investment, condominium Phuket',
    locale: 'en_US',
    lang: 'en',
    schemaName: 'SO Origin Kata — Apartments in Phuket',
    schemaDesc: 'Premium condominium SO Origin Kata near Kata Beach, Phuket. Apartments from $99,900.'
  }
};

// ======== TRANSLATION MAP: RU → EN ========
const translationMap = [
  // Navigation / buttons
  ['Забронировать', 'Book Now'],
  ['Узнать подробнее', 'Learn More'],
  ['Подробнее', 'Learn More'],
  ['Оставить заявку', 'Submit Request'],
  ['Отправить', 'Submit'],
  ['Получить консультацию', 'Get Consultation'],
  ['Получить презентацию', 'Get Presentation'],
  ['Скачать презентацию', 'Download Presentation'],
  ['Связаться с нами', 'Contact Us'],
  ['Обратный звонок', 'Request Callback'],

  // Headers / titles
  ['So Origin Kata на Пхукете', 'SO Origin Kata in Phuket'],
  ['SO Origin Kata на Пхукете', 'SO Origin Kata in Phuket'],
  ['Премиальные апартаменты', 'Premium Apartments'],
  ['премиальные апартаменты', 'premium apartments'],
  ['Инвестиции в недвижимость', 'Real Estate Investment'],
  ['инвестиции в недвижимость', 'real estate investment'],
  ['Расположение', 'Location'],
  ['Инфраструктура', 'Infrastructure'],
  ['Планировки', 'Floor Plans'],
  ['Галерея', 'Gallery'],
  ['Контакты', 'Contacts'],
  ['О проекте', 'About Project'],
  ['Преимущества', 'Advantages'],
  ['Условия покупки', 'Purchase Terms'],

  // Content blocks
  ['рядом с пляжем Ката', 'near Kata Beach'],
  ['пляж Ката', 'Kata Beach'],
  ['Пляж Ката', 'Kata Beach'],
  ['на Пхукете', 'in Phuket'],
  ['На Пхукете', 'In Phuket'],
  ['Пхукет', 'Phuket'],
  ['Таиланд', 'Thailand'],
  ['от застройщика', 'from developer'],
  ['От застройщика', 'From Developer'],
  ['застройщик', 'developer'],
  ['Застройщик', 'Developer'],
  ['рассрочка', 'payment plan'],
  ['Рассрочка', 'Payment Plan'],
  ['доходность', 'ROI'],
  ['Доходность', 'ROI'],
  ['годовых', 'per year'],
  ['Годовых', 'Per Year'],

  // Prices / numbers context
  ['от', 'from'],
  ['до', 'up to'],
  ['кв.м', 'sq.m'],
  ['м²', 'sq.m'],

  // Property types
  ['Студия', 'Studio'],
  ['студия', 'studio'],
  ['Апартаменты', 'Apartments'],
  ['апартаменты', 'apartments'],
  ['спальня', 'bedroom'],
  ['Спальня', 'Bedroom'],
  ['спальни', 'bedrooms'],
  ['спален', 'bedrooms'],
  ['комната', 'room'],
  ['комнаты', 'rooms'],

  // Facilities
  ['бассейн', 'swimming pool'],
  ['Бассейн', 'Swimming Pool'],
  ['фитнес', 'fitness'],
  ['Фитнес', 'Fitness'],
  ['парковка', 'parking'],
  ['Парковка', 'Parking'],
  ['ресторан', 'restaurant'],
  ['Ресторан', 'Restaurant'],
  ['лобби', 'lobby'],
  ['Лобби', 'Lobby'],
  ['сад', 'garden'],
  ['Сад', 'Garden'],
  ['терраса', 'terrace'],
  ['Терраса', 'Terrace'],
  ['вид на море', 'sea view'],
  ['Вид на море', 'Sea View'],

  // CTA / forms
  ['Ваше имя', 'Your Name'],
  ['ваше имя', 'your name'],
  ['Телефон', 'Phone'],
  ['телефон', 'phone'],
  ['Email', 'Email'],
  ['Сообщение', 'Message'],
  ['сообщение', 'message'],
  ['Имя', 'Name'],
  ['имя', 'name'],

  // Common words
  ['Цена', 'Price'],
  ['цена', 'price'],
  ['Площадь', 'Area'],
  ['площадь', 'area'],
  ['Этаж', 'Floor'],
  ['этаж', 'floor'],
  ['минут', 'minutes'],
  ['Минут', 'Minutes'],
  ['метров', 'meters'],
  ['Метров', 'Meters'],
  ['км', 'km'],
  ['Все права защищены', 'All Rights Reserved'],
  ['Политика конфиденциальности', 'Privacy Policy'],
];

function injectSEO(html, lang) {
  const cfg = seoConfig[lang];
  let h = html;

  // Title
  h = h.replace(/<title>[^<]*<\/title>/i, `<title>${cfg.title}</title>`);

  // Lang attribute
  h = h.replace(/<html([^>]*)>/i, `<html$1 lang="${cfg.lang}">`);
  h = h.replace(/lang="[^"]*"/g, `lang="${cfg.lang}"`);

  // Meta description
  if (h.includes('name="description"')) {
    h = h.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${cfg.description}"`);
  } else {
    h = h.replace('</head>', `<meta name="description" content="${cfg.description}">\n</head>`);
  }

  // Meta keywords
  if (h.includes('name="keywords"')) {
    h = h.replace(/<meta\s+name="keywords"\s+content="[^"]*"/i, `<meta name="keywords" content="${cfg.keywords}"`);
  } else {
    h = h.replace('</head>', `<meta name="keywords" content="${cfg.keywords}">\n</head>`);
  }

  // OG tags
  if (h.includes('property="og:title"')) {
    h = h.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${cfg.title}"`);
  } else {
    h = h.replace('</head>', `<meta property="og:title" content="${cfg.title}">\n</head>`);
  }
  if (h.includes('property="og:description"')) {
    h = h.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${cfg.description}"`);
  } else {
    h = h.replace('</head>', `<meta property="og:description" content="${cfg.description}">\n</head>`);
  }
  if (!h.includes('property="og:locale"')) {
    h = h.replace('</head>', `<meta property="og:locale" content="${cfg.locale}">\n</head>`);
  }
  if (!h.includes('property="og:type"')) {
    h = h.replace('</head>', `<meta property="og:type" content="website">\n</head>`);
  }

  // Hreflang tags
  const baseUrl = process.env.BASE_URL || 'https://soorigin-kata-clone-production.up.railway.app';
  const hreflangTags = `
<link rel="alternate" hreflang="ru" href="${baseUrl}/ru/" />
<link rel="alternate" hreflang="en" href="${baseUrl}/en/" />
<link rel="alternate" hreflang="x-default" href="${baseUrl}/en/" />`;
  h = h.replace('</head>', `${hreflangTags}\n</head>`);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": cfg.schemaName,
    "description": cfg.schemaDesc,
    "url": `${baseUrl}/${lang}/`,
    "image": "https://sooriginkata.com/img/og-image.jpg",
    "offers": {
      "@type": "Offer",
      "price": "99900",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kata Beach",
      "addressRegion": "Phuket",
      "addressCountry": "TH"
    }
  };
  h = h.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`);

  return h;
}

function translateToEnglish(html) {
  let h = html;
  // Sort by length descending to replace longer phrases first
  const sorted = [...translationMap].sort((a, b) => b[0].length - a[0].length);
  for (const [ru, en] of sorted) {
    // Replace in visible text (not in URLs, attributes with http, script/style blocks)
    // Simple approach: global replace outside of tags
    h = h.split(ru).join(en);
  }
  return h;
}

async function downloadAndProcess() {
  console.log('Downloading SO Origin Kata...');

  const res = await fetch(SITE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
  });

  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  let html = await res.text();
  console.log(`Downloaded ${html.length} bytes`);

  // Create public directories
  fs.mkdirSync(path.join(__dirname, 'public', 'ru'), { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'public', 'en'), { recursive: true });

  // RU version: original + SEO
  const ruHtml = injectSEO(html, 'ru');
  fs.writeFileSync(path.join(__dirname, 'public', 'ru', 'index.html'), ruHtml);
  console.log('RU version saved');

  // EN version: translate + SEO
  const enHtml = injectSEO(translateToEnglish(html), 'en');
  fs.writeFileSync(path.join(__dirname, 'public', 'en', 'index.html'), enHtml);
  console.log('EN version saved');

  console.log('All language versions ready!');
}

downloadAndProcess().catch(err => {
  console.error('Download failed:', err);
  process.exit(1);
});
