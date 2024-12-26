"""Utility to format content for WooCommerce API updates."""
from typing import Dict, List, Any
from datetime import datetime

def format_for_woo_api(products: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Format product data for WooCommerce API bulk update.
    
    Args:
        products: List of products with generated content
        
    Returns:
        Dictionary formatted for WooCommerce API update
    """
    woo_updates = {
        "update": []
    }
    
    for product in products:
        # Get the generated content
        title = product["outputs"]["title"]
        description = product["outputs"]["description"]
        
        # Create WooCommerce API compatible update
        update = {
            "id": product["product_id"],
            "name": title,
            "description": description,
            "short_description": f"{title}\n\n{description}",  # Use both for SEO
            "meta_data": [
                {
                    "key": "_generated_timestamp",
                    "value": datetime.now().isoformat()
                }
            ]
        }
        
        woo_updates["update"].append(update)
    
    return woo_updates
