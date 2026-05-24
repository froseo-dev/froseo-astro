/**
 * 410 Gone — Pages Function voor /podcast-marketing-adverteren-podcasts/.
 *
 * Vroegere blogpost die we niet meer aanbieden. We geven bewust 410
 * (Gone) terug ipv 404 (Not Found) zodat Google de URL sneller uit de
 * index haalt en geen toekomstige crawls verspilt aan deze permanent
 * verwijderde resource.
 *
 * Pages Functions worden alleen aangeroepen als er geen statische
 * pagina op dit pad bestaat (en die is er niet, dus dit vangt alle
 * inkomende hits af).
 */

const html = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Pagina verwijderd | Froseo</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f4eee0; color: #1a1a1a; margin: 0; padding: 64px 24px; }
    main { max-width: 560px; margin: 0 auto; text-align: center; }
    h1 { font-size: 32px; margin: 0 0 12px; }
    p { font-size: 17px; line-height: 1.55; opacity: 0.85; margin: 0 0 24px; }
    a { display: inline-block; padding: 12px 24px; background: #5b21b6; color: #fff; text-decoration: none; border-radius: 999px; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>Pagina permanent verwijderd</h1>
    <p>De content die hier stond, bieden we niet meer aan. Onze actuele kennisbank en diensten vind je via de knop hieronder.</p>
    <a href="/">Terug naar froseo.nl</a>
  </main>
</body>
</html>`;

export const onRequest = () => {
  return new Response(html, {
    status: 410,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
};
