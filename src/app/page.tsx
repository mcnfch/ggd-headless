import Image from 'next/image';
import { CategoryGrid } from '@/components/category/CategoryGrid';
import { Hero } from '@/components/Hero';
import { getCategories, getProducts } from '@/lib/woocommerce';
import menuConfig from '@/config/menu.json';

interface MenuItem {
  title: string;
  type: 'product' | 'non-product';
  visible: boolean;
  order: number;
}

// Set revalidation time to 0 to ensure fresh data on each request
export const revalidate = 0;

// Helper function to convert menu title to slug
function titleToSlug(title: string): string {
  const slugMap = {
    'New Arrivals': 'new-arrivals',
    'Accessories': 'accessories',
    'Women': 'women',
    'Men': 'men',
    'Shoes': 'shoes',
    'Newly Dropped': 'newly-dropped'
  };
  return slugMap[title] || title.toLowerCase().replace(/\s+/g, '-');
}

export default async function Home() {
  // Fetch all categories
  const categories = await getCategories();
  
  // Get menu configuration
  const menuItems = (menuConfig as { menuItems: MenuItem[] }).menuItems
    .filter(item => item.visible && item.type === 'product')
    .sort((a, b) => a.order - b.order);

  // Match categories with menu items and fetch random products
  const categoryProducts = {};
  const categoryDescriptions = {};
  
  const slugs = [
    'new-arrivals',
    'featured-collections',
    'women',
    'men',
    'accessories',
    'groovy-gear'
  ];

  for (const menuItem of menuItems) {
    let categorySlug = titleToSlug(menuItem.title);
    
    // Handle "New Arrivals" special case
    if (menuItem.title === "New Arrivals") {
      try {
        const { products } = await getProducts('', { 
          orderby: 'date',
          order: 'desc',
          per_page: 20 // Fetch more products to get a good random selection
        });
        if (products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          categoryProducts[categorySlug] = products[randomIndex];
          categoryDescriptions[categorySlug] = "Discover our latest arrivals - fresh styles added daily!";
        }
      } catch (error) {
        console.error('Error fetching new arrivals:', error);
      }
    } else {
      // Find matching category by name (case-insensitive)
      const category = categories.find(
        cat => cat.name.toLowerCase() === menuItem.title.toLowerCase()
      );
      
      if (category) {
        try {
          const { products } = await getProducts(category.slug);
          if (products.length > 0) {
            const randomIndex = Math.floor(Math.random() * products.length);
            categoryProducts[categorySlug] = products[randomIndex];
            categoryDescriptions[categorySlug] = category.description || '';
          }
        } catch (error) {
          console.error(`Error fetching products for category ${category.slug}:`, error);
        }
      }
    }
  }

  return (
    <main>
      <Hero />
      <CategoryGrid categories={menuItems.map(item => {
        const slug = titleToSlug(item.title);
        return {
          id: slug,
          name: item.title,
          href: `/product-category/${slug}`,
          description: categoryDescriptions[slug],
          product: categoryProducts[slug]
        };
      })} />
    </main>
  );
}
