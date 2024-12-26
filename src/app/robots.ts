import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://dev.groovygallerydesigns.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/product/',
          '/product-category/',
          '/shop',
          '/blog'
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/cart/',
          '/checkout/',
          '/my-account/',
          '/*?add-to-cart=*',
          '/*?remove_item=*'
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,  
  };
}
