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
    get_language_parser,
    get_text_splitter
)
from lightrag_poc.file_mappings import LANGUAGE_TO_GLOB_PATTERNS


CHUNKING_SETTINGS = {
    "chunk_size": 1000,
    "chunk_overlap": 100,
    "apply_text_splitting": True
}

async def process_codebase_by_directory(codebase_dir: str, ignore_patterns: List[str] = None, chunk_size: int = 1000, chunk_overlap: int = 100, apply_text_splitting: bool = True) -> List[Dict[str, str]]:
    """
    Process the codebase by directory using DirectoryLoader approach for different file types.
    
    This function organizes file loading by file type and uses the appropriate loaders
    for each type, with special handling for code files that benefit from language parsing.
    It can also apply text splitting to break down large chunks into smaller ones.
    
    Args:
        codebase_dir: Directory containing the codebase
        ignore_patterns: List of glob patterns to ignore
        chunk_size: Size of each chunk in characters for text splitting
        chunk_overlap: Overlap between chunks in characters for text splitting
        apply_text_splitting: Whether to apply text splitting to large chunks
        
    Returns:
        List of dictionaries containing 'content' and 'file_path' for each chunk
    """
    if ignore_patterns is None:
        ignore_patterns = []
    
    all_chunks = []  # Will contain dictionaries with 'content' and 'file_path' keys
    
    # Use centralized file type groups for processing
    file_groups = LANGUAGE_TO_GLOB_PATTERNS
    
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
                            
                            if apply_text_splitting:
                                # Apply text splitting for large chunks
                                splitter = get_text_splitter(filepath, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
                                if splitter and docs:
                                    split_docs = splitter.split_documents(docs)
                                    for doc in split_docs:
                                        all_chunks.append({
                                            'content': doc.page_content,
                                            'file_path': filepath
                                        })
                                else:
                                    # If no splitter available or splitting failed, use original docs
                                    for doc in docs:
                                        all_chunks.append({
                                            'content': doc.page_content,
                                            'file_path': filepath
                                        })
                            else:
                                # No splitting, use original docs
                                for doc in docs:
                                    all_chunks.append({
                                        'content': doc.page_content,
                                        'file_path': filepath
                                    })
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
                                    matching_docs = []
                                    
                                    # Filter docs to only include those matching our specific file
                                    for doc in docs:
                                        if doc.metadata.get("source") == file_path:
                                            matching_docs.append(doc)
                                    
                                    if apply_text_splitting and matching_docs:
                                        # Apply text splitting for large chunks
                                        splitter = get_text_splitter(file_path, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
                                        if splitter:
                                            split_docs = splitter.split_documents(matching_docs)
                                            for doc in split_docs:
                                                all_chunks.append({
                                                    'content': doc.page_content,
                                                    'file_path': file_path
                                                })
                                        else:
                                            # If no splitter available, use original docs
                                            for doc in matching_docs:
                                                all_chunks.append({
                                                    'content': doc.page_content,
                                                    'file_path': file_path
                                                })
                                    else:
                                        # No splitting, use original docs
                                        for doc in matching_docs:
                                            all_chunks.append({
                                                'content': doc.page_content,
                                                'file_path': file_path
                                            })
                                        
                            except Exception as e:
                                print(f"Error loading {file_path} with language parser: {e}")

            
            except Exception as e:
                print(f"Error processing {language} files: {e}")
    
    print(f"Total chunks extracted: {len(all_chunks)}")
    return all_chunks

async def process_codebase(ignore_patterns: List[str] = None) -> List[Dict[str, str]]:
    """
    Process the codebase and return chunks.
    This function is maintained for backward compatibility.
    It now uses the directory-based approach internally.
    
    Args:
        ignore_patterns: List of glob patterns to ignore
        
    Returns:
        List of dictionaries containing 'content' and 'file_path' for each chunk
    """
    from lightrag_poc.config import CODEBASE_DIR
    
    if ignore_patterns is None:
        from lightrag_poc.config import DEFAULT_IGNORE_PATTERNS
        ignore_patterns = DEFAULT_IGNORE_PATTERNS.copy()
    
    # Ensure codebase directory exists
    if not os.path.exists(CODEBASE_DIR):
        print(f"Codebase directory '{CODEBASE_DIR}' does not exist.")
        return []  # Empty list of dictionaries
    
    # Load custom ignore patterns if .lightragignore exists
    lightragignore_path = os.path.join(CODEBASE_DIR, '.lightragignore')
    if os.path.exists(lightragignore_path):
        with open(lightragignore_path, 'r') as f:
            custom_patterns = [line.strip() for line in f if line.strip() and not line.startswith('#')]
            ignore_patterns.extend(custom_patterns)
    
    # Use the directory-based approach
    return await process_codebase_by_directory(
        CODEBASE_DIR, 
        ignore_patterns=ignore_patterns,
        **CHUNKING_SETTINGS
    )
