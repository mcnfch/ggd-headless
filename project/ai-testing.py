import openai
import requests
from openai import Client
import os

# Set up your OpenAI and BigCommerce API keys
client = Client(api_key=os.getenv('OPENAI_API_KEY'))

# Your BigCommerce credentials and API endpoint
access_token = 'i9xfhbcsltmo800apx5dybvw8khwu21'
store_hash = 'sz0eoyttoh'
api_base_url = f'https://api.bigcommerce.com/stores/{store_hash}/v3'

# Headers for authentication
headers = {
    'X-Auth-Token': access_token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

# Define primary and secondary keywords
PRIMARY_KEYWORDS = ['mens joggers', 'sweatpants', 'hoodies', 'blankets']
SECONDARY_KEYWORDS = ['jogger pants', 'mens sweatpants', 'hoodie blankets', 'winter hoodies', 'sherpa blankets']

def get_product_images():
    # Fetch only non-visible products
    url = f"{api_base_url}/catalog/products?include=images&is_visible=false"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        products = response.json()['data']
        product_images = []
        for product in products:
            if 'images' in product:
                image_url = product['images'][0]['url_zoom']  # Get the first image for each product
                product_images.append((product['name'], image_url))
        return product_images
    else:
        raise Exception(f"Failed to fetch products: {response.status_code}, {response.text}")

def analyze_image_and_generate_title(image_url):
    # Call the vision API to analyze the image and generate a description and title
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": """Create a concise, SEO-optimized alt tag under 125 characters that accurately describes the image. Highlight key features like bold designs, vibrant patterns, intricate details, and style categories such as psychedelic, boho-chic, retro, festival/EDM-inspired, eclectic, sustainable, trippy/abstract, or kaleidoscopic. Avoid using phrases like 'image of' or 'picture of.' Ensure the alt text is clear, unique, and enhances search visibility."""},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ],
        max_tokens=300
    )
    return response.choices[0].message.content

def generate_description(title, image_analysis):
    # Use AI to generate a detailed product description based on the title and image analysis, sprinkling in keywords
    primary_keyword = PRIMARY_KEYWORDS[0]  # You can randomize or choose based on conditions
    secondary_keyword = SECONDARY_KEYWORDS[0]  # Same logic for secondary
    prompt = f"Using the title '{title}' and analysis '{image_analysis}', write a product description. Focus on {primary_keyword} and {secondary_keyword}, making it attractive for festival-goers."
    
    completion = client.chat.completions.create(
        model="chatgpt-4o-latest",
        messages=[
            {"role": "system", "content": 'Write the product description based on the title and keywords provided.'},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500
    )
    return completion.choices[0].message.content

def main():
    product_images = get_product_images()
    
    for product_name, image_url in product_images:
        print(f"Processing product: {product_name}")
        image_analysis = analyze_image_and_generate_title(image_url)
        print(f"Generated Title and Analysis: {image_analysis}")
        
        description = generate_description(product_name, image_analysis)
        print(f"Generated Description: {description}")

if __name__ == "__main__":
    main()
