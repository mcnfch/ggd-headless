"""Content filtering utilities for product descriptions and titles."""

import re
from typing import List, Set, Optional, Dict
from enum import Enum

class FilterType(Enum):
    """Types of content filters available."""
    MARKETING_CLICHES = "marketing_cliches"
    AI_TERMS = "ai_terms"
    CTAS = "ctas"
    ALL = "all"

class ContentFilter:
    """Filter content based on banned phrases and patterns."""
    
    MARKETING_CLICHES = {
        "step into",
        "elevate your experience",
        "unleash your potential",
        "discover the difference",
        "transform your life",
        "unlock the secrets",
        "revolutionize your",
        "experience the future of",
        "your journey starts here",
        "embrace the power of"
    }
    
    AI_TERMS = {
        "believe it or not",
        "buckle up",
        "in addition",
        "additionally",
        "navigating",
        "when it comes to",
        "embarking",
        "embark",
        "bespoke",
        "look no further",
        "however it is important to note",
        "meticulous",
        "meticulously",
        "complexities",
        "realm",
        "tailored",
        "towards",
        "underpins",
        "everchanging",
        "ever-evolving",
        "the world of",
        "not only",
        "diving into",
        "seeking more than just",
        "designed to enhance",
        "it's not merely",
        "our suite",
        "it is advisable",
        "daunting",
        "dives",
        "dive in",
        "let's delve",
        "let's dive in",
        "in the heart of",
        "remember",
        "in an era",
        "picture this",
        "in the realm of",
        "amongst",
        "unlock the secrets",
        "unveil the secrets",
        "robust"
    }
    
    CTAS = {
        "make it yours today",
        "don't wait—claim yours now",
        "say yes to something special",
        "it's your time to shine",
        "your treat awaits—go for it",
        "add a little joy to your day",
        "get ready to love it",
        "snag your favorite now",
        "transform your day—shop now",
        "the perfect pick is here—grab it",
        "bring it home today",
        "indulge yourself—you deserve it",
        "upgrade your life—start here",
        "ready, set, enjoy",
        "elevate your everyday—buy now",
        "step into luxury—shop today",
        "happiness is a click away",
        "find your perfect match now",
        "treat yourself to something amazing",
        "this could be yours—get it now",
        "unlock something special today",
        "don't miss this—shop now",
        "say hello to your new favorite",
        "go ahead, make it yours",
        "your dream item is waiting",
        "time to spoil yourself—shop now",
        "seize the moment—grab it today",
        "because you're worth it—buy now",
        "make your move—treat yourself"
    }
    
    def __init__(self, 
                 filter_types: Optional[List[FilterType]] = None,
                 additional_phrases: Optional[List[str]] = None):
        """Initialize with optional filter types and additional banned phrases."""
        self.filter_types = filter_types or [FilterType.ALL]
        self.banned_phrases = set()
        
        # Add phrases based on filter types
        if FilterType.ALL in self.filter_types:
            self.banned_phrases.update(self.MARKETING_CLICHES)
            self.banned_phrases.update(self.AI_TERMS)
            self.banned_phrases.update(self.CTAS)
        else:
            if FilterType.MARKETING_CLICHES in self.filter_types:
                self.banned_phrases.update(self.MARKETING_CLICHES)
            if FilterType.AI_TERMS in self.filter_types:
                self.banned_phrases.update(self.AI_TERMS)
            if FilterType.CTAS in self.filter_types:
                self.banned_phrases.update(self.CTAS)
        
        # Add any additional phrases
        if additional_phrases:
            self.banned_phrases.update(set(phrase.lower() for phrase in additional_phrases))
        
        # Create regex pattern for matching
        self.pattern = self._create_pattern(self.banned_phrases)
    
    @staticmethod
    def _create_pattern(phrases: Set[str]) -> re.Pattern:
        """Create regex pattern from phrases, handling optional [noun] placeholders."""
        patterns = []
        for phrase in phrases:
            # Handle [noun] placeholder in phrases
            if "[noun]" in phrase:
                # Replace [noun] with a pattern that matches any word
                pattern = phrase.replace("[noun]", r"\w+")
            else:
                pattern = re.escape(phrase)  # Escape special regex characters
            patterns.append(pattern)
        
        # Join patterns with OR operator and make case insensitive
        return re.compile("|".join(patterns), re.IGNORECASE)
    
    def contains_banned_phrase(self, text: str) -> bool:
        """Check if text contains any banned phrases."""
        return bool(self.pattern.search(text))
    
    def get_banned_phrases_found(self, text: str) -> List[str]:
        """Return list of banned phrases found in text."""
        return [match.group(0) for match in self.pattern.finditer(text.lower())]
    
    def filter_text(self, text: str) -> str:
        """Remove or replace banned phrases with more direct language."""
        filtered_text = text
        matches = list(self.pattern.finditer(text))
        
        # Process matches in reverse to maintain string indices
        for match in reversed(matches):
            start, end = match.span()
            # For now, we'll just remove the phrase
            # Could be enhanced to replace with alternative phrases
            filtered_text = filtered_text[:start] + filtered_text[end:]
        
        return filtered_text.strip()
    
    @classmethod
    def get_all_banned_phrases(cls) -> Dict[str, Set[str]]:
        """Get all banned phrases organized by category."""
        return {
            "marketing_cliches": cls.MARKETING_CLICHES,
            "ai_terms": cls.AI_TERMS,
            "ctas": cls.CTAS
        }
