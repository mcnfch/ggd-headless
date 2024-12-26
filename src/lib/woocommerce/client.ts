import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Create WooCommerce API client
const client = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || 'http://localhost:8080',
  consumerKey: process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET || '',
  version: 'wc/v3',
});

export default client;
