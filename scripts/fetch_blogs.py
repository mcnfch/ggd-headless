#!/usr/bin/env python3
import os
import json
import requests
from datetime import datetime
from woocommerce import API
from dotenv import load_dotenv
from pathlib import Path
import html

# Load environment variables
load_dotenv()

# WooCommerce API configuration
wcapi = API(
    url=os.getenv('NEXT_PUBLIC_WOOCOMMERCE_URL'),
    consumer_key=os.getenv('NEXT_PUBLIC_WOOCOMMERCE_KEY'),
    consumer_secret=os.getenv('NEXT_PUBLIC_WOOCOMMERCE_SECRET'),
    version="wp/v2"  # Using WordPress REST API for blogs
)

def create_html_file(post, output_dir):
    """Create an HTML file from a blog post"""
    post_date = datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
    formatted_date = post_date.strftime('%Y-%m-%d')
    
    # Create a URL-friendly filename
    filename = f"{formatted_date}-{post['slug']}.html"
    
    # Basic HTML template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(post['title']['rendered'])}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        .post-meta {{
            color: #666;
            margin-bottom: 20px;
        }}
        .post-content {{
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <article>
        <h1>{html.escape(post['title']['rendered'])}</h1>
        <div class="post-meta">
            <p>Published on: {formatted_date}</p>
        </div>
        <div class="post-content">
            {post['content']['rendered']}
        </div>
    </article>
</body>
</html>"""
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Write the HTML file
    output_file = output_dir / filename
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return filename

def fetch_and_save_blogs():
    """Fetch blog posts and save them as HTML files"""
    # Create output directory
    output_dir = Path('project/data/blogs')
    
    try:
        # Fetch blog posts
        print("Fetching blog posts...")
        response = requests.get(
            f"{os.getenv('NEXT_PUBLIC_WOOCOMMERCE_URL')}/wp-json/wp/v2/posts",
            params={'per_page': 100}  # Adjust this number based on your needs
        )
        response.raise_for_status()
        posts = response.json()
        
        # Create a manifest to store blog information
        manifest = {
            'last_updated': datetime.utcnow().isoformat(),
            'total_posts': len(posts),
            'posts': []
        }
        
        # Process each post
        for post in posts:
            try:
                filename = create_html_file(post, output_dir)
                manifest['posts'].append({
                    'id': post['id'],
                    'title': post['title']['rendered'],
                    'date': post['date'],
                    'slug': post['slug'],
                    'filename': filename
                })
                print(f"Created {filename}")
            except Exception as e:
                print(f"Error processing post {post['id']}: {str(e)}")
        
        # Save manifest
        manifest_file = output_dir / 'manifest.json'
        with open(manifest_file, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"\nSuccessfully processed {len(manifest['posts'])} posts")
        print(f"Manifest saved to {manifest_file}")
        
    except Exception as e:
        print(f"Error fetching blog posts: {str(e)}")

if __name__ == "__main__":
    fetch_and_save_blogs()
