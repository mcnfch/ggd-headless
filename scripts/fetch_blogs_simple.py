#!/usr/bin/env python3
import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# Base URL from the logs (using the same URL seen in the WooCommerce config)
BASE_URL = "https://woo.festivalravegear.com"

def fetch_json(url):
    """Fetch JSON data from URL"""
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except urllib.error.URLError as e:
        print(f"Error fetching data: {e}")
        return None

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
    <title>{post['title']['rendered']}</title>
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
        <h1>{post['title']['rendered']}</h1>
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
    
    # Fetch blog posts using WordPress REST API
    posts_url = f"{BASE_URL}/wp-json/wp/v2/posts?per_page=100"
    posts = fetch_json(posts_url)
    
    if not posts:
        print("No posts found or error fetching posts")
        return
    
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

if __name__ == "__main__":
    fetch_and_save_blogs()
