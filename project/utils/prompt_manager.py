"""Prompt management utilities for content generation."""

import json
from typing import Dict, Any, Optional, List
from pathlib import Path

class PromptManager:
    """Manages loading and formatting prompts from JSON repositories."""
    
    def __init__(self, prompts_dir: str = "/opt/gg-woo-next/project/prompts"):
        """Initialize with path to prompts directory."""
        self.prompts_dir = Path(prompts_dir)
        self.prompts = {}
        self._load_prompts()
    
    def _load_prompts(self):
        """Load all prompt JSON files from the prompts directory."""
        for prompt_file in self.prompts_dir.glob("*.json"):
            try:
                with open(prompt_file, 'r', encoding='utf-8') as f:
                    self.prompts[prompt_file.stem] = json.load(f)
            except Exception as e:
                print(f"Error loading prompt file {prompt_file}: {str(e)}")
    
    def get_system_prompt(self, prompt_type: str) -> str:
        """Get formatted system prompt for specified type."""
        if prompt_type not in self.prompts:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        prompt_data = self.prompts[prompt_type]
        role = prompt_data["role"]
        system_prompt = prompt_data["system_prompt"]
        
        # Format system prompt
        prompt = f"You are a {role['name']}: {role['description']}\n\n"
        prompt += f"{system_prompt['core_instruction']}\n\n"
        
        # Add style guide
        prompt += "Do:\n"
        prompt += "\n".join(f"- {do}" for do in system_prompt["style_guide"]["do"])
        prompt += "\n\nDon't:\n"
        prompt += "\n".join(f"- {dont}" for dont in system_prompt["style_guide"]["dont"])
        
        # Add vision guide if present
        if "vision_guide" in system_prompt:
            vision_guide = system_prompt["vision_guide"]
            prompt += "\n\nVisual Analysis Guide:\n"
            prompt += "Analyze:\n"
            prompt += "\n".join(f"- {item}" for item in vision_guide["analyze"])
            
            if isinstance(vision_guide.get("focus"), list):
                prompt += "\n\nFocus on:\n"
                prompt += "\n".join(f"- {item}" for item in vision_guide["focus"])
            elif isinstance(vision_guide.get("focus"), dict):
                for section, items in vision_guide["focus"].items():
                    prompt += f"\n\n{section.replace('_', ' ').title()}:\n"
                    prompt += "\n".join(f"- {item}" for item in items)
        
        return prompt
    
    def get_user_prompt(self, prompt_type: str, **kwargs) -> str:
        """Get formatted user prompt for specified type with variables."""
        if prompt_type not in self.prompts:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        template = self.prompts[prompt_type]["user_prompt_template"]
        
        # Format main prompt
        prompt = template["format"].format(**kwargs) + "\n\n"
        prompt += "Guidelines:\n"
        
        # Format guidelines with variables
        guidelines = []
        for guideline in template["guidelines"]:
            try:
                guidelines.append(guideline.format(**kwargs))
            except KeyError:
                # Skip guidelines that require missing variables
                continue
        
        prompt += "\n".join(f"- {guideline}" for guideline in guidelines)
        
        return prompt
    
    def get_vision_analysis_points(self, prompt_type: str) -> Optional[List[str]]:
        """Get list of vision analysis points if they exist."""
        if prompt_type not in self.prompts:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        system_prompt = self.prompts[prompt_type].get("system_prompt", {})
        vision_guide = system_prompt.get("vision_guide", {})
        
        if vision_guide:
            analysis_points = vision_guide.get("analyze", [])
            focus_points = vision_guide.get("focus", [])
            
            if isinstance(focus_points, dict):
                # Flatten nested focus points
                focus_points = [
                    item 
                    for section in focus_points.values() 
                    for item in section
                ]
            
            return analysis_points + focus_points
        return None
    
    def get_validation_rules(self, prompt_type: str) -> Optional[Dict[str, Any]]:
        """Get validation rules for specified prompt type if they exist."""
        if prompt_type not in self.prompts:
            raise ValueError(f"Unknown prompt type: {prompt_type}")
        
        return self.prompts[prompt_type].get("validation_rules")
