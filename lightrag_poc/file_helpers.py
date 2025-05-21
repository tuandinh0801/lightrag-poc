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
    PythonLoader,
    JSONLoader,
    CSVLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    RecursiveJsonSplitter
)

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
        # Handle Python files
        if file_ext == ".py":
            return PythonLoader(file_path)
        
        # Handle JSON files
        elif file_ext == ".json":
            return JSONLoader(file_path, jq_schema=".", text_content=False)
        
        # Handle Markdown files
        elif file_ext in [".md", ".markdown"]:
            return UnstructuredMarkdownLoader(file_path)
        
        # Handle CSV files
        elif file_ext == ".csv":
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
        # Map file extensions to language parsers based on LanguageParser implementation
        language_map = {
            ".py": "python",
            ".js": "js",
            ".jsx": "js",
            ".ts": "ts",
            ".tsx": "ts",
            ".java": "java",
            ".go": "go",
            ".rb": "ruby",
            ".php": "php",
            ".c": "c",
            ".cpp": "cpp",
            ".hpp": "cpp",
            ".cc": "cpp",
            ".h": "c",
            ".cs": "csharp",
            ".rs": "rust",
            ".kt": "kotlin",
            ".scala": "scala",
            ".lua": "lua",
            ".pl": "perl",
            ".ex": "elixir",
            ".exs": "elixir",
            ".sql": "sql",
            ".cbl": "cobol",
            ".cob": "cobol",
        }
        
        language = language_map.get(file_ext)
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

def get_text_splitter(file_path: str) -> Optional[Any]:
    """Get the appropriate text splitter for a file based on its extension."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == ".json":
        return RecursiveJsonSplitter(chunk_size=1000, chunk_overlap=100)
    else:
        return RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
