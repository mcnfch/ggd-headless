import Image from 'next/image';
import { CategoryGrid } from '@/components/category/CategoryGrid';
import { Hero } from '@/components/Hero';
import { getCategories, getProducts } from '@/lib/woocommerce';
import menuConfig from '@/config/menu.json';

interface MenuItem {
  title: string;
  type: 'product';
  visible: boolean;
  order: number;
  customImage?: string;
  customDescription?: string;
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
    'Groovy Gear': 'groovy-gear',
    'Custom Designs': 'custom-designs'
  };
  return slugMap[title] || title.toLowerCase().replace(/\s+/g, '-');
}

export default async function Home() {
  // Fetch all categories
  const categories = await getCategories();
  
  // Get menu configuration
  const menuItems = (menuConfig as { menuItems: MenuItem[] }).menuItems
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order);

  // Match categories with menu items and fetch random products
  const categoryProducts = {};
  const categoryDescriptions = {};

  for (const menuItem of menuItems) {
    const slug = titleToSlug(menuItem.title);
    
    // Handle Custom Designs special case
    if (menuItem.title === "Custom Designs") {
      try {
        const { products } = await getProducts('custom-designs');
        if (products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          categoryProducts[slug] = products[randomIndex];
          categoryDescriptions[slug] = "Express your unique style with our custom design service. Let's create something extraordinary together!";
        } else {
          // Fallback if no products found
          categoryProducts[slug] = {
            images: [{ src: '/images/custom-designs.jpg' }],
            name: menuItem.title
          };
          categoryDescriptions[slug] = "Express your unique style with our custom design service. Let's create something extraordinary together!";
        }
      } catch (error) {
        console.error('Error fetching custom designs:', error);
        // Fallback on error
        categoryProducts[slug] = {
          images: [{ src: '/images/custom-designs.jpg' }],
          name: menuItem.title
        };
        categoryDescriptions[slug] = "Express your unique style with our custom design service. Let's create something extraordinary together!";
      }
      continue;
    }
    
    // Handle "New Arrivals" special case
    if (menuItem.title === "New Arrivals") {
      try {
        const { products } = await getProducts('', { 
          orderby: 'date',
          order: 'desc',
          per_page: 20
        });
        if (products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          categoryProducts[slug] = products[randomIndex];
          categoryDescriptions[slug] = "Discover our latest arrivals - fresh styles added daily!";
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
            categoryProducts[slug] = products[randomIndex];
            categoryDescriptions[slug] = category.description || '';
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
      <CategoryGrid 
        categories={menuItems.map(item => {
          const slug = titleToSlug(item.title);
          const isCustomDesigns = item.title === "Custom Designs";
          return {
            id: slug,
            name: item.title,
            href: isCustomDesigns ? '/custom-designs' : `/product-category/${slug}`,
            description: categoryDescriptions[slug],
            product: categoryProducts[slug],
            isCustom: isCustomDesigns
          };
        })}
      />
    </main>
  );
}
