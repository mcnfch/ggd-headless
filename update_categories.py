#!/usr/bin/env python3

category_descriptions = {
    # Parent Categories
    "Women": {
        "title": "Women's Festival Fashion | Rave Wear & Accessories",
        "description": "Explore our women's festival fashion collection. From stunning rave wear to essential accessories, find everything you need for your next festival adventure."
    },
    "Men": {
        "title": "Men's Festival Fashion | Rave Wear & Essentials",
        "description": "Discover our men's festival fashion collection. From comfortable rave wear to practical accessories, gear up for your next festival experience."
    },
    "Accessories": {
        "title": "Festival Accessories | Essential Rave Gear",
        "description": "Complete your festival look with our range of accessories. From practical bags to stylish accessories, find everything you need to enhance your festival experience."
    },
    "Groovy Gear": {
        "title": "Groovy Gear | Festival Comfort Essentials",
        "description": "Stay comfortable at your next festival with our Groovy Gear collection. From cozy blankets to practical accessories, we've got your festival comfort covered."
    },
    "New Arrivals": {
        "title": "New Festival Fashion Arrivals | Latest Rave Wear",
        "description": "Be the first to shop our newest festival fashion arrivals. Discover the latest trends in rave wear, accessories, and festival essentials."
    },
    "Featured Collections": {
        "title": "Featured Festival Collections | Curated Rave Wear",
        "description": "Shop our featured festival collections. Carefully curated rave wear and accessories for unforgettable festival moments."
    },
    "Festival Rave Outfits": {
        "title": "Complete Festival Outfits | Ready-to-Wear Rave Sets",
        "description": "Find your perfect festival outfit. From matching sets to coordinated pieces, get ready-to-wear looks for your next rave."
    },

    # Existing Categories
    "Festival Rave Tops": {
        "title": "Festival Tops & Rave Wear | Stylish & Vibrant Designs",
        "description": "Discover our collection of festival tops and rave wear. From crop tops to bodysuits, find unique styles that make you stand out."
    },
    "Festival Rave Bottoms": {
        "title": "Festival Bottoms | Shorts, Skirts & Dance Pants",
        "description": "Shop comfortable and stylish festival bottoms. From flowy dance pants to sparkly shorts, find the perfect match for your festival outfit."
    },
    "Festival Rave Dresses": {
        "title": "Festival Dresses | Boho & Rave Style Dresses",
        "description": "Browse our selection of festival dresses. From bohemian maxis to rave-ready minis, find the perfect dress for your next event."
    },
    "Festival Rave Swimwear": {
        "title": "Festival Swimwear | Unique Bikinis & One-Pieces",
        "description": "Explore festival-ready swimwear. From holographic bikinis to statement one-pieces, perfect for pool parties and beach raves."
    },
    "Women's Festival Rave Footwear": {
        "title": "Women's Festival Footwear | Comfortable & Stylish",
        "description": "Find the perfect festival footwear. From platform boots to comfortable sneakers, dance all day and night in style."
    },
    "Festival Rave Outerwear": {
        "title": "Festival Outerwear | Jackets & Hoodies",
        "description": "Browse festival outerwear. From lightweight jackets to cozy hoodies, stay comfortable while looking great."
    },
    "Men's Festival Rave Footwear": {
        "title": "Men's Festival Footwear | Comfortable & Durable",
        "description": "Shop men's festival footwear. From sturdy boots to breathable sneakers, keep your feet comfortable all festival long."
    },
    "Festival Rave Bags & Backpacks": {
        "title": "Festival Bags & Packs | Functional & Stylish",
        "description": "Find the perfect festival bag. From hydration packs to fanny packs, keep your essentials secure and accessible."
    },
    "Festival Rave Hats": {
        "title": "Festival Hats & Headwear | Unique Styles",
        "description": "Shop festival hats and headwear. From bucket hats to snapbacks, protect yourself from the sun while looking fresh."
    },
    "Festival Rave Pashmina": {
        "title": "Festival Pashminas & Scarves | Colorful & Versatile",
        "description": "Explore our collection of pashminas and scarves. Perfect for sun protection, warmth, or adding a pop of color to your outfit."
    },
    "Festival Rave Sunglasses": {
        "title": "Festival Sunglasses | Bold & Protective Eyewear",
        "description": "Browse festival sunglasses. From kaleidoscope lenses to classic shapes, protect your eyes while making a statement."
    },
    "Festival Rave Blankets": {
        "title": "Festival Blankets | Cozy & Colorful Comfort",
        "description": "Find your perfect festival blanket. Soft, durable, and perfect for lounging or staying warm during night shows."
    },
    "Festival Rave Hoodie Blankets": {
        "title": "Hoodie Blankets | Wearable Comfort",
        "description": "Shop our hoodie blankets. The perfect combination of comfort and mobility for chilly festival nights."
    },
    "Festival Rave Tapestries": {
        "title": "Festival Tapestries | Vibrant Wall Art & Decor",
        "description": "Discover our collection of tapestries. Perfect for decorating your campsite or creating shade at festivals."
    },
    "Sets & Matching Outfits": {
        "title": "Festival Sets & Matching Outfits | Coordinated Style",
        "description": "Shop our coordinated festival sets and matching outfits. From two-piece sets to complete looks, make a statement with perfectly paired pieces."
    },
    "Seasonal Collections": {
        "title": "Seasonal Festival Collections | Trending Styles",
        "description": "Explore our seasonal festival collections. Find the latest trends and styles perfect for the current festival season."
    },
    "Collaborations": {
        "title": "Artist Collaborations | Exclusive Festival Wear",
        "description": "Discover our exclusive artist collaborations. Unique festival wear designed in partnership with talented artists and creators."
    }
}

import subprocess
import json
import sys

def get_categories():
    """Get all WooCommerce categories"""
    print("Fetching categories...")
    try:
        result = subprocess.run(
            ['wp', 'term', 'list', 'product_cat', '--format=json', '--allow-root'],
            capture_output=True,
            text=True,
            cwd='/var/www/woo.groovygallerydesigns.com'
        )
        if result.stderr:
            print(f"Warning: {result.stderr}", file=sys.stderr)
        
        categories = json.loads(result.stdout)
        print(f"Found {len(categories)} categories")
        return categories
    except subprocess.CalledProcessError as e:
        print(f"Error executing wp-cli: {e}", file=sys.stderr)
        print(f"Command output: {e.output}", file=sys.stderr)
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing categories JSON: {e}", file=sys.stderr)
        print(f"Raw output: {result.stdout}", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Unexpected error getting categories: {e}", file=sys.stderr)
        return []

def update_category(term_id, title, description):
    """Update a single category"""
    full_description = f"{title}\n\n{description}"
    try:
        result = subprocess.run(
            ['wp', 'term', 'update', 'product_cat', str(term_id),
             f'--description={full_description}', '--allow-root'],
            capture_output=True,
            text=True,
            cwd='/var/www/woo.groovygallerydesigns.com'
        )
        if result.returncode == 0:
            print(f"✓ Successfully updated category {term_id}")
            return True
        else:
            print(f"✗ Failed to update category {term_id}: {result.stderr}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"✗ Error updating category {term_id}: {e}", file=sys.stderr)
        return False

def main():
    print("Starting category update process...")
    categories = get_categories()
    if not categories:
        print("No categories found or error occurred", file=sys.stderr)
        sys.exit(1)
    
    updated_count = 0
    skipped_count = 0
    
    for cat in categories:
        name = cat['name']
        if name in category_descriptions:
            print(f"\nProcessing category: {name} (ID: {cat['term_id']})")
            desc = category_descriptions[name]
            if update_category(
                cat['term_id'],
                desc['title'],
                desc['description']
            ):
                updated_count += 1
        else:
            print(f"Skipping category: {name} (no description defined)")
            skipped_count += 1
    
    print(f"\nUpdate complete!")
    print(f"Categories updated: {updated_count}")
    print(f"Categories skipped: {skipped_count}")

if __name__ == "__main__":
    main()
