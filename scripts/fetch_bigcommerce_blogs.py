#!/usr/bin/env python3
import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from urllib.parse import urlencode

# Load environment variables from .env.local
load_dotenv('.env.local')

# Get BigCommerce credentials
STORE_HASH = os.getenv('BC_STORE_HASH', 'sz0eoyttoh')
API_TOKEN = os.getenv('BC_ACCWSS_TOKEN', '6m8dv45ey9lgqrhoy85ladpb0wxlcfq')
BASE_URL = f"https://api.bigcommerce.com/stores/{STORE_HASH}/v2"

def fetch_blogs(is_published=True, limit=250):
    """Fetch blog posts from BigCommerce API"""
    headers = {
        'X-Auth-Token': API_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    # Add query parameters
    params = {
        'is_published': 'true' if is_published else 'false',
        'limit': limit
    }
    query_string = urlencode(params)
    
    request = urllib.request.Request(
        f"{BASE_URL}/blog/posts?{query_string}",
        headers=headers
    )
    
    try:
        with urllib.request.urlopen(request) as response:
            data = json.loads(response.read().decode())
            print(f"Successfully fetched {len(data)} blog posts")
            return data
    except urllib.error.URLError as e:
        print(f"Error fetching blogs: {e}")
        if hasattr(e, 'read'):
            print("Response:", e.read().decode())
        return None

def create_html_file(post, output_dir):
    """Create an HTML file from a blog post"""
    # Handle both date formats (object and ISO8601 string)
    if isinstance(post['published_date'], dict):
        post_date = datetime.strptime(post['published_date']['date'], '%Y-%m-%d %H:%M:%S.%f')
    else:
        post_date = datetime.fromisoformat(post['published_date_iso8601'].replace('Z', '+00:00'))
    
    formatted_date = post_date.strftime('%Y-%m-%d')
    
    # Create a URL-friendly filename using the post's URL
    safe_url = post['url'].strip('/').replace('/', '-')
    filename = f"{formatted_date}-{safe_url}.html"
    
    # Basic HTML template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{post['title']}</title>
    <meta name="description" content="{post.get('meta_description', '')}">
    <meta name="keywords" content="{post.get('meta_keywords', '')}">
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
        .tags {{
            margin-top: 20px;
            color: #666;
        }}
        .tags span {{
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 3px;
            margin-right: 5px;
        }}
        .summary {{
            font-style: italic;
            color: #666;
            margin: 20px 0;
            padding: 10px;
            background: #f9f9f9;
            border-left: 3px solid #ddd;
        }}
    </style>
</head>
<body>
    <article>
        <h1>{post['title']}</h1>
        <div class="post-meta">
            <p>Published on: {formatted_date}</p>
            {f'<p>Author: {post["author"]}</p>' if post.get('author') else ''}
            {f'<p>Preview URL: <a href="{post["preview_url"]}">{post["preview_url"]}</a></p>' if post.get('preview_url') else ''}
        </div>
        {f'<div class="summary">{post["summary"]}</div>' if post.get('summary') else ''}
        <div class="post-content">
            {post['body']}
        </div>
        <div class="tags">
            Tags: {' '.join(f'<span>{tag}</span>' for tag in post['tags'])}
        </div>
        {f'<div class="thumbnail"><img src="{post["thumbnail_path"]}" alt="Blog thumbnail"></div>' if post.get('thumbnail_path') else ''}
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
    output_dir = Path('project/data/bigcommerce_blogs')
    
    # Fetch blog posts
    posts = fetch_blogs()
    
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
                'title': post['title'],
                'url': post['url'],
                'preview_url': post.get('preview_url', ''),
                'date': post['published_date_iso8601'] if 'published_date_iso8601' in post else post['published_date']['date'],
                'tags': post['tags'],
                'is_published': post['is_published'],
                'meta_description': post.get('meta_description', ''),
                'meta_keywords': post.get('meta_keywords', ''),
                'author': post.get('author', ''),
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
    if not STORE_HASH or not API_TOKEN:
        print("Error: Missing BigCommerce credentials!")
        print("Please ensure BC_STORE_HASH and BC_ACCWSS_TOKEN are set in your environment.")
    else:
        fetch_and_save_blogs()
