"""
File helper functions for LightRAG POC.
"""

import os
import pathlib
from fnmatch import fnmatch
from typing import List, Optional, Any

# Langchain imports
from langchain_community.document_loaders import (
    TextLoader,
    JSONLoader,
    CSVLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    RecursiveJsonSplitter,
    Language
)

# Import centralized file mappings
from lightrag_poc.file_mappings import get_language_for_extension

def should_ignore_path(path: str, ignore_patterns: List[str]) -> bool:
    """Check if a file path should be ignored based on patterns."""
    # Convert to posix path for consistent pattern matching
    posix_path = pathlib.Path(path).as_posix()
    
    for pattern in ignore_patterns:
        if fnmatch(posix_path, pattern):
            return True
    
    return False

def get_file_loader(file_path: str) -> Optional[Any]:
    """Get the appropriate loader for a file based on its extension."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        # Handle JSON files
        if file_ext == ".json":
            return JSONLoader(file_path, jq_schema=".", text_content=False)
        
        # Handle Markdown files
        if file_ext in [".md", ".markdown"]:
            return UnstructuredMarkdownLoader(file_path)
        
        # Handle CSV files
        if file_ext == ".csv":
            return CSVLoader(file_path)
        
        # Default to text loader for other file types
        else:
            return TextLoader(file_path)
    except Exception as e:
        print(f"Error creating loader for {file_path}: {e}")
        return None

def get_language_parser(file_path: str, create_loader: bool = False, directory: str = None, glob_patterns: List[str] = None) -> Optional[Any]:
    """
    Get the appropriate language parser for a file based on its extension.
    
    Args:
        file_path: Path to the file
        create_loader: If True, returns a GenericLoader with the appropriate parser instead of just the parser
        directory: Directory to use for the loader (required if create_loader is True)
        glob_patterns: Glob patterns to use for the loader (required if create_loader is True)
        
    Returns:
        A LanguageParser instance or a GenericLoader instance with the appropriate parser
    """
    from langchain_community.document_loaders.generic import GenericLoader
    
    file_ext = os.path.splitext(file_path)[1].lower()
    
    try:
        # Use the centralized mapping to get the language for this extension
        language = get_language_for_extension(file_ext)
        
        # Handle JavaScript and TypeScript special cases for the LanguageParser
        # (LanguageParser uses 'js' and 'ts' instead of 'javascript' and 'typescript')
        if language == 'javascript':
            language = 'js'
        elif language == 'typescript':
            language = 'ts'
            
        if not language:
            return None
            
        parser = LanguageParser(language=language)
        
        if create_loader:
            if directory is None or glob_patterns is None:
                raise ValueError("Directory and glob_patterns are required when create_loader is True")
                
            return GenericLoader.from_filesystem(
                directory,
                glob=glob_patterns,
                parser=parser
            )
        
        return parser
    except Exception as e:
        print(f"Error creating language parser for {file_path}: {e}")
        return None

def get_text_splitter(file_path: str, chunk_size: int = 1000, chunk_overlap: int = 100) -> Optional[Any]:
    """Get the appropriate text splitter for a file based on its extension.
    
    Args:
        file_path: Path to the file
        chunk_size: Size of each chunk in characters
        chunk_overlap: Overlap between chunks in characters
        
    Returns:
        A text splitter instance appropriate for the file type
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Map file extensions to language enum for code-specific splitting
    language_splitter_map = {
        # JavaScript/TypeScript
        ".js": Language.JS,
        ".jsx": Language.JS,
        ".ts": Language.TS,
        ".tsx": Language.TS,
        # Python
        ".py": Language.PYTHON,
        # Java
        ".java": Language.JAVA,
        # C/C++
        ".c": Language.CPP,
        ".cpp": Language.CPP,
        ".h": Language.CPP,
        ".hpp": Language.CPP,
        # C#
        ".cs": Language.CSHARP,
        # Go
        ".go": Language.GO,
        # Ruby
        ".rb": Language.RUBY,
        # Rust
        ".rs": Language.RUST,
        # PHP
        ".php": Language.PHP,
        # Scala
        ".scala": Language.SCALA,
        # Swift
        ".swift": Language.SWIFT,
        # Markdown
        ".md": Language.MARKDOWN,
        ".markdown": Language.MARKDOWN,
        # HTML
        ".html": Language.HTML,
        ".htm": Language.HTML,
        # CSS
        ".css": Language.CSS,
        # SQL
        ".sql": Language.SQL,
        # JSON
        ".json": None,  # Special case handled separately
    }
    
    # Handle JSON files with specialized splitter
    if file_ext == ".json":
        return RecursiveJsonSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    
    # Use language-specific splitter if available
    language = language_splitter_map.get(file_ext)
    if language:
        return RecursiveCharacterTextSplitter.from_language(
            language=language,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
    
    # Default to generic text splitter for other file types
    return RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
