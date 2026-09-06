// Genera public/sitemap.xml unendo le pagine fisse del sito
// alle pagine dinamiche delle vie approvate, leggendole da Supabase.
// Viene eseguito automaticamente prima di ogni "npm run build".

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SITO = 'https://onbelay.it';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Mancano le variabili VITE_SUPABASE_URL / VITE_SUPABASE_KEY: sitemap non generata.'
  );
  process.exit(0); // non blocchiamo la build per questo, la sitemap non è indispensabile
}

const supabase = createClient(supabaseUrl, supabaseKey);

function paginaXml(loc, changefreq, priority, lastmod) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

async function generaSitemap() {
  const paginePagineFisse = [
    paginaXml(`${SITO}/`, 'daily', '1.0'),
    paginaXml(`${SITO}/registrati`, 'monthly', '0.5'),
    paginaXml(`${SITO}/privacy`, 'yearly', '0.3'),
    paginaXml(`${SITO}/termini`, 'yearly', '0.3'),
  ];

  const { data: vie, error } = await supabase
    .from('vie')
    .select('id, ultimo_aggiornamento')
    .eq('stato', 'approvata')
    .eq('richiesta_eliminazione', false);

  if (error) {
    console.error('Errore nel leggere le vie da Supabase:', error.message);
  }

  const pagineVie = (vie || []).map((via) =>
    paginaXml(
      `${SITO}/via/${via.id}`,
      'weekly',
      '0.8',
      via.ultimo_aggiornamento
        ? new Date(via.ultimo_aggiornamento).toISOString().split('T')[0]
        : undefined
    )
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...paginePagineFisse, ...pagineVie].join('\n')}
</urlset>
`;

  writeFileSync('public/sitemap.xml', xml);
  console.log(`Sitemap generata con ${paginePagineFisse.length + pagineVie.length} pagine.`);
}

generaSitemap();