/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://woo.festivalravegear.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/server-sitemap.xml'], // Exclude server-side sitemap
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://woo.festivalravegear.com/server-sitemap.xml', // Add dynamic sitemap
    ],
  },
} 