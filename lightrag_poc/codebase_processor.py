"""
Codebase processing functions for LightRAG POC.
"""

import os
import glob
import pathlib
from typing import List, Dict, Any, Optional

from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser

from lightrag_poc.file_helpers import (
    should_ignore_path,
    get_file_loader,
    get_language_parser
)

async def process_codebase_by_directory(codebase_dir: str, ignore_patterns: List[str] = None) -> List[str]:
    """
    Process the codebase by directory using DirectoryLoader approach for different file types.
    
    This function organizes file loading by file type and uses the appropriate loaders
    for each type, with special handling for code files that benefit from language parsing.
    """
    if ignore_patterns is None:
        ignore_patterns = []
    
    all_chunks = []
    
    # Define file type groups for processing
    file_groups = {
        "python": ["**/*.py"],
        "javascript": ["**/*.js", "**/*.jsx"],
        "typescript": ["**/*.ts", "**/*.tsx"],
        "java": ["**/*.java"],
        "go": ["**/*.go"],
        "ruby": ["**/*.rb"],
        "php": ["**/*.php"],
        "c": ["**/*.c", "**/*.h"],
        "cpp": ["**/*.cpp", "**/*.hpp", "**/*.cc"],
        "csharp": ["**/*.cs"],
        "rust": ["**/*.rs"],
        "markdown": ["**/*.md", "**/*.markdown"],
        "json": ["**/*.json"],
        "yaml": ["**/*.yaml", "**/*.yml"],
        "text": ["**/*.txt"],
        "csv": ["**/*.csv"],
        "other": ["**/*.*"],  # Catch-all for other file types
    }
    
    # Process each file group
    for language, glob_patterns in file_groups.items():
        print(f"Processing {language} files...")
        
        # Skip specialized handling for non-code files
        if language in ["markdown", "json", "yaml", "text", "csv", "other"]:
            # Use regular file loading for these types
            for pattern in glob_patterns:
                for filepath in glob.glob(os.path.join(codebase_dir, pattern), recursive=True):
                    # Skip files that match ignore patterns
                    if should_ignore_path(filepath, ignore_patterns):
                        continue
                    
                    # Skip directories
                    if os.path.isdir(filepath):
                        continue
                    
                    try:
                        loader = get_file_loader(filepath)
                        if loader:
                            docs = loader.load()
                            for doc in docs:
                                all_chunks.append(doc.page_content)
                    except Exception as e:
                        print(f"Error loading {filepath}: {e}")
        else:
            # Use language parser for code files
            try:
                # Process all code files using the enhanced get_language_parser function
                for pattern in glob_patterns:
                    files = glob.glob(os.path.join(codebase_dir, pattern), recursive=True)
                    for file_path in files:
                        if os.path.isfile(file_path) and not should_ignore_path(file_path, ignore_patterns):
                            try:
                                # Get the appropriate language parser or loader
                                file_dir = os.path.dirname(file_path)
                                file_name = os.path.basename(file_path)
                                
                                # Create a loader with the language parser
                                loader = get_language_parser(
                                    file_path,
                                    create_loader=True,
                                    directory=file_dir,
                                    glob_patterns=file_name  # Just this file
                                )
                                
                                if loader:
                                    docs = loader.load()
                                    for doc in docs:
                                        # Only include if it matches our specific file
                                        if doc.metadata.get("source") == file_path:
                                            all_chunks.append(doc.page_content)
                                        
                            except Exception as e:
                                print(f"Error loading {file_path} with language parser: {e}")

            
            except Exception as e:
                print(f"Error processing {language} files: {e}")
    
    print(f"Total chunks extracted: {len(all_chunks)}")
    return all_chunks

async def process_codebase(ignore_patterns: List[str] = None) -> List[str]:
    """
    Process the codebase and return chunks.
    This function is maintained for backward compatibility.
    It now uses the directory-based approach internally.
    """
    from lightrag_poc.config import CODEBASE_DIR
    
    if ignore_patterns is None:
        from lightrag_poc.config import DEFAULT_IGNORE_PATTERNS
        ignore_patterns = DEFAULT_IGNORE_PATTERNS.copy()
    
    # Ensure codebase directory exists
    if not os.path.exists(CODEBASE_DIR):
        print(f"Codebase directory '{CODEBASE_DIR}' does not exist.")
        return []
    
    # Load custom ignore patterns if .lightragignore exists
    lightragignore_path = os.path.join(CODEBASE_DIR, '.lightragignore')
    if os.path.exists(lightragignore_path):
        with open(lightragignore_path, 'r') as f:
            custom_patterns = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            ignore_patterns.extend(custom_patterns)
    
    # Use the directory-based approach
    return await process_codebase_by_directory(CODEBASE_DIR, ignore_patterns=ignore_patterns)
