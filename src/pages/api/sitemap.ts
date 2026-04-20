import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseLeagueService } from '@/services/firebaseCorrespondence'; // Assuming we want dynamic data later

const VULAI_BASE_URL = 'https://www.unilimelightsports.com';

const generateStaticSitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
  <url>
    <loc>${VULAI_BASE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${VULAI_BASE_URL}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${VULAI_BASE_URL}/schedule</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${VULAI_BASE_URL}/sports</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${VULAI_BASE_URL}/teams</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Extended Pages -->
  <url>
    <loc>${VULAI_BASE_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Optionally fetch dynamic records like leagues or teams here
    // const leagues = await firebaseLeagueService.listLeagues();
    
    // For now, construct the XML consisting of core domains
    const sitemap = generateStaticSitemap();
    
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Sitemap Error: ', error);
    res.status(500).send('Error generating sitemap');
  }
}
