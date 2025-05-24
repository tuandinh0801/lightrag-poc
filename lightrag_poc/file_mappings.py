"""
Centralized file extension mappings for LightRAG POC.

This module provides a single source of truth for file extensions and their
associated language types to ensure consistency across the codebase.
"""

from typing import Dict, List

# Map of language types to their file extensions
LANGUAGE_TO_EXTENSIONS: Dict[str, List[str]] = {
    "python": ["py"],
    "javascript": ["js", "jsx"],
    "typescript": ["ts", "tsx"],
    "java": ["java"],
    "go": ["go"],
    "ruby": ["rb"],
    "php": ["php"],
    "c": ["c", "h"],
    "cpp": ["cpp", "hpp", "cc"],
    "csharp": ["cs"],
    "rust": ["rs"],
    "kotlin": ["kt"],
    "scala": ["scala"],
    "lua": ["lua"],
    "perl": ["pl"],
    "elixir": ["ex", "exs"],
    "sql": ["sql"],
    "cobol": ["cbl", "cob"],
    "markdown": ["md", "markdown"],
    "json": ["json"],
    "yaml": ["yaml", "yml"],
    "text": ["txt"],
    "csv": ["csv"],
}

# Map of file extensions to their language type (inverse of LANGUAGE_TO_EXTENSIONS)
EXTENSION_TO_LANGUAGE: Dict[str, str] = {}
for language, extensions in LANGUAGE_TO_EXTENSIONS.items():
    for ext in extensions:
        EXTENSION_TO_LANGUAGE[ext] = language

# Generate glob patterns for each language (used in DirectoryLoader)
LANGUAGE_TO_GLOB_PATTERNS: Dict[str, List[str]] = {
    language: [f"**/*.{ext}" for ext in extensions]
    for language, extensions in LANGUAGE_TO_EXTENSIONS.items()
}

# Add a catch-all category for other file types
LANGUAGE_TO_GLOB_PATTERNS["other"] = ["**/*.*"]

def get_language_for_extension(extension: str) -> str:
    """
    Get the language type for a given file extension.
    
    Args:
        extension: File extension (with or without the leading dot)
        
    Returns:
        The language type or None if not found
    """
    # Remove leading dot if present
    clean_ext = extension[1:] if extension.startswith('.') else extension
    return EXTENSION_TO_LANGUAGE.get(clean_ext)

def get_extensions_for_language(language: str) -> List[str]:
    """
    Get all file extensions for a given language type.
    
    Args:
        language: The language type
        
    Returns:
        List of file extensions (without leading dots)
    """
    return LANGUAGE_TO_EXTENSIONS.get(language, [])

def get_glob_patterns_for_language(language: str) -> List[str]:
    """
    Get glob patterns for a given language type.
    
    Args:
        language: The language type
        
    Returns:
        List of glob patterns
    """
    return LANGUAGE_TO_GLOB_PATTERNS.get(language, [])
