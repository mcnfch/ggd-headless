import OpenAI from 'openai';
import { woocommerce } from '../lib/woocommerce';
import type { WooProduct } from '../lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const CATEGORIES = [
  { name: 'Accessories', id: 32 },
  { name: 'Festival Rave Blankets', id: 40 },
  { name: 'Festival Rave Bottoms', id: 49 },
  { name: 'Festival Rave Dresses', id: 43 },
  { name: 'Festival Rave Hats', id: 35 },
  { name: 'Festival Rave Hoodie Blankets', id: 39 },
  { name: 'Festival Rave Outerwear', id: 50 },
  { name: 'Festival Rave Outfits', id: 51 }
];

const SYSTEM_PROMPT_CATEGORIZER = `You are a festival and rave fashion expert specializing in product categorization.
Your task is to analyze product information and select the most appropriate category.

Available categories:
${CATEGORIES.map(c => `- ${c.name}`).join('\n')}

Consider these keywords when categorizing:
- Rave clothing, Festival clothing
- Rave accessories, Festival accessories
- Rave gear, Festival gear
- LED, glow-in-the-dark, reflective
- Holographic, iridescent
- Dance comfort, festival survival

Respond ONLY with the exact category name from the list above that best matches the product.
Do not add any explanation or additional text.`;

const SYSTEM_PROMPT_OPTIMIZER = `You are a festival and rave e-commerce optimization expert.
Your task is to optimize product titles and descriptions for maximum SEO and conversion.

Follow these rules:
1. Titles:
   - Length: 50-60 characters
   - Include primary keywords early
   - Highlight important attributes
   - Avoid filler words

2. Descriptions:
   - Meta length: 150-160 characters
   - Full description: 300-500 words
   - Focus on benefits over features
   - Include keywords naturally
   - Use bullet points for features

Key themes to incorporate:
- Festival and rave culture
- Comfort and durability for all-day events
- Unique style and self-expression
- Practical features (pockets, water-resistance, etc.)
- Social proof and popularity

Respond in JSON format:
{
  "title": "optimized title",
  "description": "optimized description"
}`;

async function getUncategorizedProducts(): Promise<WooProduct[]> {
  try {
    const response = await woocommerce.get('products', {
      category: '0', // Uncategorized products
      per_page: 100,
      status: 'publish'
    });
    return response.data as WooProduct[];
  } catch (error) {
    console.error('Error fetching uncategorized products:', error);
    return [];
  }
}

async function analyzeImage(imageUrl: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this festival/rave product, focusing on its type, style, and key features." },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content;
    return content ?? '';
  } catch (error) {
    console.error('Error analyzing image:', error);
    return '';
  }
}

async function determineCategory(productName: string, imageAnalysis: string): Promise<number | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_CATEGORIZER },
        { 
          role: "user", 
          content: `Product Name: ${productName}\nImage Analysis: ${imageAnalysis}`
        }
      ]
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) return null;
    
    const category = CATEGORIES.find(c => c.name === content);
    return category?.id ?? null;
  } catch (error) {
    console.error('Error determining category:', error);
    return null;
  }
}

async function optimizeProduct(productName: string, imageAnalysis: string): Promise<{ title: string; description: string } | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_OPTIMIZER },
        { 
          role: "user", 
          content: `Original Name: ${productName}\nProduct Analysis: ${imageAnalysis}\nOptimize the title and description for this festival/rave product.`
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    
    try {
      return JSON.parse(content) as { title: string; description: string };
    } catch (parseError) {
      console.error('Error parsing optimization response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error optimizing product:', error);
    return null;
  }
}

interface ProductUpdate {
  name?: string;
  description?: string;
  categories?: Array<{ id: number }>;
}

async function updateProduct(productId: number, updates: ProductUpdate) {
  try {
    await woocommerce.put(`products/${productId}`, updates);
    console.log(`Updated product ${productId}`);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
  }
}

async function main() {
  const products = await getUncategorizedProducts();
  console.log(`Found ${products.length} uncategorized products`);

  for (const product of products) {
    console.log(`Processing product: ${product.name}`);

    // Get main image URL
    const mainImage = product.images[0]?.src;
    if (!mainImage) {
      console.log(`No image found for product ${product.id}, skipping...`);
      continue;
    }

    // Analyze image
    const imageAnalysis = await analyzeImage(mainImage);
    if (!imageAnalysis) {
      console.log(`Failed to analyze image for product ${product.id}, skipping...`);
      continue;
    }

    // Determine category
    const categoryId = await determineCategory(product.name, imageAnalysis);
    if (!categoryId) {
      console.log(`Failed to determine category for product ${product.id}, skipping...`);
      continue;
    }

    // Optimize product details
    const optimization = await optimizeProduct(product.name, imageAnalysis);
    if (!optimization) {
      console.log(`Failed to optimize product ${product.id}, skipping...`);
      continue;
    }

    // Update product
    await updateProduct(product.id, {
      name: optimization.title,
      description: optimization.description,
      categories: [{ id: categoryId }]
    });
  }

  console.log('Finished processing all products');
}

// Run the script
main().catch(console.error);

interface _CategoryRule {
  pattern: RegExp;
  category: string;
}
