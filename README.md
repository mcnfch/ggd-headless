# WooCommerce Next.js Integration

A modern e-commerce frontend built with Next.js 14, integrating with WooCommerce as the backend. This project uses the App Router and Server Components for optimal performance and SEO.

## Features

- **Modern Stack**: Next.js 14 with App Router and Server Components
- **E-commerce Integration**: Full WooCommerce REST API integration
- **Performance**: Server-side rendering and static generation capabilities
- **Real-time Updates**: Client-side cart management with context API
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Technical Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Integration**: WooCommerce REST API
- **Type System**: TypeScript
- **HTTP Client**: Axios
- **Caching**: Custom product and category caching system

## Environment Setup

1. Create a `.env.local` file in the project root directory:
```bash
touch /opt/woo-next/nextjs-woo/.env.local
```

2. Add the following environment variables:
```env
NEXT_PUBLIC_WOOCOMMERCE_URL=https://woo.festivalravegear.com
NEXT_PUBLIC_WOOCOMMERCE_KEY=ck_9fbfdb952b71771cd624e7e82bd9b26b55c51b22
NEXT_PUBLIC_WOOCOMMERCE_SECRET=cs_f26a1b4f70789242e28206e83f9af5e815cd533c
```

> **⚠️ IMPORTANT: Environment File Location**
> 
> - The `.env.local` file MUST be in the project root: `/opt/woo-next/nextjs-woo/.env.local`
> - This file should NEVER be committed to version control
> - Each development environment needs its own `.env.local`
> - The application will not function without these credentials
> - If using Git, ensure `.env.local` is in your `.gitignore`

These environment variables are used in:
- `src/lib/woocommerce.ts` - API client configuration
- Server-side API calls
- Client-side product fetching

## Environment Variables

The following environment variables are required for the application to run:

```bash
# WooCommerce API Configuration
NEXT_PUBLIC_WOOCOMMERCE_URL=https://your-woo-domain.com
NEXT_PUBLIC_WOOCOMMERCE_KEY=your_consumer_key
NEXT_PUBLIC_WOOCOMMERCE_SECRET=your_consumer_secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-site-domain.com
NEXT_PUBLIC_IMAGE_DOMAIN=your-site-domain.com
NEXT_PUBLIC_PROD_DOMAIN=your-prod-domain.com
NEXT_PUBLIC_WOO_DOMAIN=your-woo-domain.com

# Optional Configuration
NODE_ENV=production  # Set to 'development' for local development
```

Make sure to set these environment variables in your deployment environment.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            
│   ├── cart/              # Cart-related components
│   ├── category/          # Category page components
│   ├── layout/            # Layout components
│   └── product/           # Product-related components
├── config/                # Configuration files
│   └── menu.json         # Navigation menu structure
├── context/               # React Context providers
├── lib/                   
│   ├── cache/            # Caching implementation
│   ├── types/            # TypeScript definitions
│   └── woocommerce.ts    # WooCommerce API client
└── utils/                # Utility functions
```

## Mail Server Configuration

The e-commerce platform uses Mailcow for handling all email communications. The mail server is configured at `mail.festivalravegear.com`.

### Email Addresses

- Primary Email: info@festivalravegear.com
- Support Email: support@festivalravegear.com (alias forwarding to info@)

### DNS Configuration

The following DNS records are configured for email functionality:

1. **MX Record**:
   ```
   festivalravegear.com. IN MX 10 mail.festivalravegear.com.
   ```

2. **SPF Record**:
   ```
   festivalravegear.com. IN TXT "v=spf1 mx a ip4:147.135.112.253 ip6:2604:2dc0:101:200::2694 ~all"
   ```

3. **DKIM Record**:
   ```
   dkim._domainkey.festivalravegear.com. IN TXT "v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwOA2bdrt/+GqX5byM0+WmGbEiv97NVszzUyIPyaT7ceo3TqzZ3gbJmY6cEc7WTZxJMnAG8we6mZO2jdETy3598unExBDT66u6ediFmsLVMoaSmaHBZBGCEk8R369WImTN898haUL7a0skk42t2M936HmkyF80696aeSOeT6VC/pPedYXZOi5M7uf7Sb7YTdK2b6hNE4N+yu0OxrdQZyUFDdOM4hu4UV6+Z4OcWsnl4n37RtdJl5ogb1h998A5otYBbC0zZqBjtzo+0TgenIYbj4OHloju1PMXyVvqgZV0rurrtYkCoDqSrfbNUs3LEoEAoWI6XX9cBWpp97/ObGzqDwIDAQAB"
   ```

### Email Client Configuration

To connect an email client (like Outlook or Thunderbird), use these settings:

#### IMAP Settings
- Server: mail.festivalravegear.com
- Port: 993
- Security: SSL/TLS
- Username: [your-email]@festivalravegear.com
- Authentication: Normal Password

#### SMTP Settings
- Server: mail.festivalravegear.com
- Port: 587
- Security: STARTTLS
- Username: [your-email]@festivalravegear.com
- Authentication: Normal Password

### Webmail Access

Access webmail through SOGo at:
```
https://mail.festivalravegear.com/SOGo
```

### Important Notes

1. All support@ emails are automatically forwarded to info@festivalravegear.com
2. The mail server uses Let's Encrypt SSL certificates that auto-renew
3. Both IPv4 (147.135.112.253) and IPv6 (2604:2dc0:101:200::2694) are configured for email delivery
4. Email authentication is implemented via SPF and DKIM for improved deliverability

### Menu Configuration

The `src/config/menu.json` controls the site's navigation structure:

```json
{
  "menuItems": [
    {
      "title": "New Arrivals",
      "type": "product",
      "visible": true,
      "order": 1
    },
    // ... other menu items
  ]
}
```

Menu items are divided into two types:
- **Product Categories**: New Arrivals, Accessories, Women, Men, Groovy Gear
- **Static Pages**: Contact Us, Blog, About Us

Each menu item includes:
- `title`: Display name
- `type`: "product" or "non-product"
- `visible`: Toggle visibility
- `order`: Menu position
- `slug`: URL path (for non-product items)

Note: The menu configuration only controls visibility and order. Product category data is dynamically fetched from WooCommerce.

## Key Components

- **CategoryContent**: Handles product listing in category pages
- **ProductCard**: Reusable product display component
- **CartContext**: Manages cart state across the application
- **HeaderWrapper**: Main navigation and cart preview
- **ProductList**: Handles product grid display with infinite loading

## API Architecture

> **🔄 Evolution from Scattered to Centralized API Calls**
>
> Previous versions of this project suffered from scattered API calls throughout components and pages, leading to:
> - Inconsistent error handling
> - Duplicate code
> - Difficult debugging
> - Build-time issues
> - Poor maintainability
> - Inconsistent caching
>
> The current version implements a **centralized API architecture** in `src/lib/woocommerce.ts` which:
> - Provides a single source of truth for all WooCommerce API interactions
> - Implements consistent error handling and logging
> - Integrates seamlessly with the caching system
> - Supports various API call types (GET, POST, PUT, DELETE)
> - Can be called from any component or page
> - Makes debugging and maintenance significantly easier

### Centralized API Features

1. **Unified Configuration**
   - Single point for API credentials
   - Consistent versioning
   - Centralized endpoint management

2. **Error Handling**
   - Standardized error responses
   - Detailed error logging
   - Graceful fallbacks

3. **Type Safety**
   - TypeScript interfaces for all API responses
   - Strict type checking
   - Better developer experience

4. **Performance Optimization**
   - Integration with caching layer
   - Request deduplication
   - Efficient data fetching

5. **Available Methods**
   - Product fetching (single/multiple)
   - Category management
   - Order processing
   - Custom queries
   - WordPress pages/posts

> **⚠️ IMPORTANT: API Integration**
>
> Always use the centralized API methods from `src/lib/woocommerce.ts`.
> NEVER make direct API calls from components or pages.
> This ensures consistency and maintainability across the project.

## API Integration

The project integrates with WooCommerce REST API for:
- Product listing and details
- Category management
- Cart operations
- Order processing

> **⚠️ IMPORTANT: Data Source of Truth**
> 
> All product and category data MUST be fetched dynamically from the WooCommerce backend:
> - NEVER hardcode product information
> - NEVER hardcode category structures
> - NEVER create static product lists
> - NEVER maintain local category hierarchies
>
> The WooCommerce backend server is the ONLY source of truth for all product and category data. This ensures:
> - Real-time inventory accuracy
> - Up-to-date pricing
> - Consistent product information
> - Dynamic category management
> - Proper stock status

## Important Development Notes

### Data Management Rules

1. **Dynamic Data Requirements**
   - ✅ DO fetch all product data from WooCommerce API
   - ✅ DO fetch all category data from WooCommerce API
   - ✅ DO use the caching system for performance
   - ❌ DO NOT hardcode any product information
   - ❌ DO NOT hardcode any category structures
   - ❌ DO NOT create static product lists

2. **Source of Truth**
   - The WooCommerce backend is the SINGLE source of truth
   - All product and category data must remain dynamic
   - Only the menu structure (visibility/order) can be configured locally
   - Any hardcoded product or category data will lead to inconsistencies

3. **Why This Matters**
   - Ensures real-time inventory accuracy
   - Maintains pricing consistency
   - Allows for dynamic category management
   - Prevents data synchronization issues
   - Enables seamless content updates
   - Supports multi-region deployment

## WordPress & WooCommerce Prerequisites

#### WordPress Requirements
- WordPress 6.0 or higher
- PHP 7.4 or higher
- MySQL 5.7 or higher
- HTTPS enabled (required for secure API communication)

#### WooCommerce Setup
1. **Required Plugins**
   - WooCommerce 8.0 or higher
   - WooCommerce API enabled
   - JWT Authentication for WP-API (recommended for secure authentication)
   - CORS enabled or appropriate headers configured

2. **WooCommerce REST API Setup**
   - Go to WooCommerce → Settings → Advanced → REST API
   - Click "Add Key"
   - Set permissions to "Read/Write"
   - Generate API keys
   - Save the Consumer Key and Consumer Secret for `.env.local`

3. **Required WooCommerce Settings**
   - Products must be published and visible
   - Categories must be set up
   - Proper permalinks configured (Settings → Permalinks)
   - Product visibility settings checked

4. **CORS Configuration**
   Add to your WordPress `functions.php` or via plugin:
   ```php
   add_action('init', function() {
     header("Access-Control-Allow-Origin: *");
     header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
     header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
   });
   ```

5. **Recommended WordPress Settings**
   - Disable XML-RPC (for security)
   - Configure proper image sizes
   - Enable pretty permalinks
   - Set up SSL certificate
   - Configure caching (recommended: WP Rocket or similar)

6. **Performance Optimizations**
   - Enable WordPress object caching
   - Configure CDN for media files
   - Optimize database regularly
   - Use image optimization plugins

7. **Security Recommendations**
   - Keep WordPress core updated
   - Keep WooCommerce updated
   - Use strong admin passwords
   - Implement rate limiting
   - Use security plugins (Wordfence recommended)

> **⚠️ IMPORTANT: API Access**
>
> - Ensure your WooCommerce REST API endpoints are accessible
> - Test API credentials before deploying
> - Keep API keys secure and never commit them to version control
> - Monitor API usage and implement rate limiting if needed
> - Regular backups of WordPress database recommended

## Caching System

The project implements an efficient in-memory caching system using `node-cache` for both products and categories:

### Category Caching (`src/lib/cache/categoryCache.ts`)
- Implements a singleton pattern for global cache access
- 1-hour cache duration (TTL: 3600 seconds)
- Caches all categories in a single key 'all_categories'
- Categories are fetched with full hierarchy information
- Automatic cache invalidation after TTL expires
- Debug logging for category structure

```typescript
// Example category cache implementation
class CategoryCache {
  private cache: NodeCache;
  private static instance: CategoryCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600,  // 1 hour
      checkperiod: 120
    });
  }
}
```

### Product Caching (`src/lib/cache/productCache.ts`)
- Implements a singleton pattern for global cache access
- 5-minute cache duration (TTL: 300 seconds)
- Caches products by:
  - Individual product slugs
  - Category-based product lists
  - Search results
- Handles pagination with 100 items per page
- Slug normalization for consistent cache keys
- Automatic cache invalidation after TTL expires

```typescript
// Example product cache implementation
class ProductCache {
  private cache: NodeCache;
  private static instance: ProductCache;

  private constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes
  }
}
```

### Cache Benefits
- Reduces WooCommerce API calls
- Improves response times
- Handles high-traffic scenarios
- Maintains data freshness with TTL
- Optimizes server resource usage

### Cache Flow
1. Request comes in for products/categories
2. System checks in-memory cache first
3. If cached data exists and is valid, returns immediately
4. If no cache or expired:
   - Fetches from WooCommerce API
   - Stores in cache with TTL
   - Returns fresh data
5. Cache automatically invalidates after TTL

This caching system ensures optimal performance while maintaining data freshness, crucial for e-commerce applications where product data changes frequently.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git
- PM2 (for production deployment)
- A WooCommerce store with REST API access

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/nextjs-woo.git
cd nextjs-woo
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Install PM2 Globally** (Required for production)
```bash
npm install -g pm2
# or
yarn global add pm2
```

4. **Configure Environment**
Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_WOOCOMMERCE_URL=https://your-woo-store.com
NEXT_PUBLIC_WOOCOMMERCE_KEY=your_consumer_key
NEXT_PUBLIC_WOOCOMMERCE_SECRET=your_consumer_secret
```

5. **Build the Project**
```bash
npm run build
# or
yarn build
```

6. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```
The development server will start at `http://localhost:3000`

7. **Start Production Server**
```bash
npm run start  # This will use PM2 for process management
# or
yarn start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server using PM2
- `npm run stop` - Stop PM2 production server
- `npm run restart` - Restart PM2 production server
- `npm run monitor` - Monitor PM2 processes
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run check-all` - Run all checks (TypeScript + ESLint)
- `npm run deploy` - Build and start production server

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Run development server:
   ```bash
   npm run dev
   ```

## Features Implementation

### Product Display
- Grid layout with responsive design
- Infinite scroll loading
- Quick cart addition
- Dynamic image loading with fallbacks

### Category Management
- Hierarchical category navigation
- Category-specific product filtering
- SEO-friendly URLs

### Cart Functionality
- Real-time cart updates
- Persistent cart state
- Dynamic price calculations

## SEO Optimization

- Server-side rendering for better indexing
- Dynamic meta tags
- Structured data implementation
- Optimized image loading

## Performance Optimizations

- Image optimization with Next.js Image component
- Client-side caching strategy
- Lazy loading of components
- Optimized bundle size

## Mobile Responsiveness

- Mobile-first design approach
- Responsive navigation
- Touch-friendly interactions
- Optimized mobile cart experience

## Security

- Environment variable protection
- API key security
- Data sanitization
- Protected API routes

## Maintenance

Regular updates needed for:
- Next.js version
- WooCommerce API compatibility
- Security patches
- Performance optimizations

## Future Enhancements

- Enhanced search functionality
- User authentication
- Wishlist feature
- Advanced filtering options
- Performance monitoring
- Analytics integration