#!/bin/bash

# Prompt for WooCommerce credentials
echo "Please enter your WooCommerce URL (e.g., https://example.com):"
read WOO_URL 

echo "Please enter your WooCommerce consumer key:"
read WOO_KEY

echo "Please enter your WooCommerce consumer secret:"
read WOO_SECRET

# Get categories
echo -e "\nFetching categories..."
curl -X GET \
  "${WOO_URL}/wp-json/wc/v3/products/categories" \
  -u "${WOO_KEY}:${WOO_SECRET}" \
  -H "Content-Type: application/json" \
  | jq '.' > debug_data/categories.json

# Get products
echo -e "\nFetching products..."
curl -X GET \
  "${WOO_URL}/wp-json/wc/v3/products?per_page=100" \
  -u "${WOO_KEY}:${WOO_SECRET}" \
  -H "Content-Type: application/json" \
  | jq '.' > debug_data/products.json

echo -e "\nDone! Check debug_data directory for the JSON files."
