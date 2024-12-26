"""Product content generation workflow orchestrator."""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from openai import OpenAI
from utils.prompt_manager import PromptManager
from utils.content_filters import ContentFilter, FilterType
from utils.rate_limiter import RateLimiter, rate_limited

@dataclass
class WorkflowConfig:
    """Configuration for the content generation workflow."""
    apply_marketing_tone: bool = False
    max_keywords_per_title: int = 2
    max_keywords_per_description: int = 3
    vision_model: str = "gpt-4-vision-preview"
    completion_model: str = "gpt-4"
    max_tokens: int = 300
    temperature: float = 0.7
    filter_types: List[FilterType] = None

    def __post_init__(self):
        """Initialize default filter types if none provided."""
        if self.filter_types is None:
            self.filter_types = [FilterType.ALL] if not self.apply_marketing_tone else []

class ProductContentWorkflow:
    """Orchestrates the product content generation workflow."""
    
    def __init__(self, config: Optional[WorkflowConfig] = None):
        """Initialize the workflow with optional configuration."""
        self.config = config or WorkflowConfig()
        self.client = OpenAI()
        self.prompt_manager = PromptManager()
        self.content_filter = ContentFilter(filter_types=self.config.filter_types)
        self.rate_limiter = RateLimiter(calls_per_minute=20)
    
    @rate_limited
    def _analyze_image(self, image_url: str) -> str:
        """Generate description for a single image using vision model."""
        vision_prompt = self.prompt_manager.get_system_prompt("vision_analysis")
        vision_points = self.prompt_manager.get_vision_analysis_points("vision_analysis")
        
        try:
            response = self.client.chat.completions.create(
                model=self.config.vision_model,
                messages=[
                    {
                        "role": "system",
                        "content": vision_prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"Analyze this product image focusing on: {', '.join(vision_points)}"
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                max_tokens=self.config.max_tokens
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error analyzing image: {str(e)}"
    
    def analyze_product_images(self, image_urls: List[str]) -> List[str]:
        """Generate descriptions for all product images."""
        return [self._analyze_image(url) for url in image_urls]
    
    @rate_limited
    def generate_product_title(
        self,
        image_descriptions: List[str],
        product_name: str,
        category: str,
        keywords: List[str]
    ) -> str:
        """Generate SEO-optimized product title."""
        # Select subset of keywords
        selected_keywords = keywords[:self.config.max_keywords_per_title]
        
        # Get prompts
        system_prompt = self.prompt_manager.get_system_prompt("title_generation")
        user_prompt = self.prompt_manager.get_user_prompt(
            "title_generation",
            product_name=product_name,
            category=category,
            keywords=selected_keywords,
            descriptions="\n".join(image_descriptions)
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.config.completion_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            
            title = response.choices[0].message.content.strip()
            
            # Apply content filtering based on configuration
            if self.content_filter.contains_banned_phrase(title):
                banned_phrases = self.content_filter.get_banned_phrases_found(title)
                print(f"Warning: Found banned phrases in title: {banned_phrases}")
                title = self.content_filter.filter_text(title)
            
            return title
        except Exception as e:
            return f"Error generating title: {str(e)}"
    
    @rate_limited
    def generate_product_description(
        self,
        image_descriptions: List[str],
        product_title: str,
        product_name: str,
        category: str,
        keywords: List[str]
    ) -> Dict[str, str]:
        """Generate SEO-optimized product description."""
        # Select subset of keywords
        selected_keywords = keywords[:self.config.max_keywords_per_description]
        
        # Get prompts
        system_prompt = self.prompt_manager.get_system_prompt("description_generation")
        user_prompt = self.prompt_manager.get_user_prompt(
            "description_generation",
            product_name=product_name,
            product_title=product_title,
            category=category,
            keywords=selected_keywords,
            descriptions="\n".join(image_descriptions)
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.config.completion_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            
            description = response.choices[0].message.content.strip()
            
            # Apply content filtering based on configuration
            if self.content_filter.contains_banned_phrase(description):
                banned_phrases = self.content_filter.get_banned_phrases_found(description)
                print(f"Warning: Found banned phrases in description: {banned_phrases}")
                description = self.content_filter.filter_text(description)
            
            # Parse description and alt text from response
            parts = description.split("---")
            main_description = parts[0].strip()
            alt_text = parts[1].strip() if len(parts) > 1 else ""
            
            return {
                "description": main_description,
                "alt_text": alt_text
            }
        except Exception as e:
            return {
                "description": f"Error generating description: {str(e)}",
                "alt_text": ""
            }
    
    def process_product(
        self,
        product_data: Dict[str, Any],
        keywords: List[str]
    ) -> Dict[str, Any]:
        """Process a single product through the entire workflow."""
        result = {
            "id": product_data["id"],
            "original_name": product_data["name"],
            "category": product_data.get("category", "Festival and Rave Accessories"),
            "images": []
        }
        
        # Step 1: Generate image descriptions
        image_urls = [img["src"] for img in product_data.get("images", [])]
        image_descriptions = self.analyze_product_images(image_urls)
        
        # Step 2: Generate product title
        title = self.generate_product_title(
            image_descriptions=image_descriptions,
            product_name=product_data["name"],
            category=result["category"],
            keywords=keywords
        )
        result["generated_title"] = title
        
        # Step 3: Generate descriptions for each image
        for i, (image, description) in enumerate(zip(product_data["images"], image_descriptions)):
            description_content = self.generate_product_description(
                image_descriptions=[description],  # Use specific image description
                product_title=title,
                product_name=product_data["name"],
                category=result["category"],
                keywords=keywords
            )
            
            result["images"].append({
                "id": image["id"],
                "src": image["src"],
                "description": description_content["description"],
                "alt_text": description_content["alt_text"],
                "vision_description": description
            })
        
        return result
