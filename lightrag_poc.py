import os
import asyncio
import ollama
from google import genai
from google.genai.types import GenerateContentConfig
from dotenv import load_dotenv
from lightrag import LightRAG, QueryParam
from lightrag.kg.shared_storage import initialize_pipeline_status
from lightrag.utils import setup_logger
from typing import List, Dict, Any, Optional, Tuple
from lightrag.llm.openai import openai_complete_if_cache
import glob
import pathlib
from fnmatch import fnmatch

# Langchain imports
from langchain_community.document_loaders import (
    TextLoader,
    PythonLoader,
    JSONLoader,
    CSVLoader,
    UnstructuredMarkdownLoader,
)
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    PythonCodeTextSplitter,
    MarkdownTextSplitter,
    Language,
)

# Load environment variables
load_dotenv()

# Set up logger
setup_logger("lightrag", level="INFO")

# Initialize Google GenAI client
google_api_key = os.getenv('GOOGLE_API_KEY')

# Configuration
WORKING_DIR = "./rag_storage"
CODEBASE_DIR = os.getenv('CODEBASE_DIR', './codebase')  # Default to './codebase' if not specified

# Default ignore patterns (similar to .gitignore)
DEFAULT_IGNORE_PATTERNS = [
    "**/.git/**",
    "**/.github/**",
    "**/__pycache__/**",
    "**/.venv/**",
    "**/node_modules/**",
    "**/.DS_Store",
    "**/*.pyc",
    "**/*.pyo",
    "**/*.pyd",
    "**/*.so",
    "**/*.dll",
    "**/*.exe",
    "**/*.bin",
]

#######################
# Embedding Functions #
#######################

async def ollama_embed(
    texts: List[str],
    model: str = "nomic-embed-text",
    options: Optional[Dict[str, Any]] = None,
) -> List[List[float]]:
    """Generate embeddings using Ollama's API."""
    if options is None:
        options = {}
    
    async def get_embedding(text: str) -> List[float]:
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: ollama.embeddings(
                    model=model,
                    prompt=text,
                    options=options
                )
            )
            return response["embedding"]
        except Exception as e:
            print(f"Error getting embedding: {e}")
            # Return a zero vector of appropriate dimension on error
            return [0.0] * 768
    
    # Process embeddings concurrently
    tasks = [get_embedding(text) for text in texts]
    return await asyncio.gather(*tasks)

# Add embedding dimension attribute
ollama_embed.embedding_dim = 768  # Standard dimension for nomic-embed-text

###################
# LLM Integration #
###################

async def llm_model_func(
    prompt, system_prompt=None, history_messages=[], keyword_extraction=False, **kwargs
) -> str:
    return await openai_complete_if_cache(
        model="gemini-2.5-flash-preview-04-17",
        prompt=prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        api_key=google_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
        **kwargs
    )

#########################
# File Helper Functions #
#########################

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
            # Use TextLoader for JSON files to avoid jq dependency issues
            # This is simpler but will treat JSON as plain text
            return TextLoader(file_path)
        
        # Handle Markdown files
        elif file_ext == ".md":
            # Use TextLoader for Markdown files to avoid dependency issues
            # This is simpler but will treat Markdown as plain text
            return TextLoader(file_path)
        
        # Handle CSV files
        elif file_ext == ".csv":
            return CSVLoader(file_path)
        
        # Default to TextLoader for other extensions
        else:
            return TextLoader(file_path)
            
    except Exception as e:
        print(f"Error creating loader for {file_path}: {e}")
        # Try to fall back to TextLoader for any other errors
        try:
            return TextLoader(file_path)
        except Exception:
            return None

def get_language_parser(file_path: str) -> Any:
    """Get the appropriate language parser for a file based on its extension."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Define parser threshold for language-specific parsing
    parser_threshold = 0  # Segments over 300 chars will be split by language-specific splitter
    
    # Map file extensions to their respective parsers
    if file_ext == ".py":
        return LanguageParser(
            language=Language.PYTHON,
            parser_threshold=parser_threshold
        )
    elif file_ext in [".js", ".jsx", ".ts", ".tsx"]:
        return LanguageParser(
            language=Language.JS if file_ext in [".js", ".jsx"] else Language.TS,
            parser_threshold=parser_threshold
        )
    
    # For other file types, return None to indicate they should be handled differently
    return None

def get_text_splitter(file_path: str) -> Any:
    """Get the appropriate text splitter for a file based on its extension."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Define chunk sizes and overlap for different file types
    chunk_size = 1000
    chunk_overlap = 200
    
    # Map file extensions to their respective splitters
    if file_ext == ".py":
        # Create Python-specific splitter
        return PythonCodeTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
    elif file_ext == ".md":
        return MarkdownTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    elif file_ext == ".json":
        # Use default recursive character splitter for JSON files
        return RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    
    # Default recursive character splitter
    return RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)

######################
# Codebase Processing #
######################

async def process_code_files(file_paths: List[str], codebase_dir: str) -> List[Tuple[str, List[str]]]:
    """Process code files using LanguageParser and return chunks for each file."""
    file_chunks = []
    
    # Group files by extension
    files_by_ext = {}
    for file_path in file_paths:
        file_ext = os.path.splitext(file_path)[1].lower()
        if file_ext not in files_by_ext:
            files_by_ext[file_ext] = []
        files_by_ext[file_ext].append(file_path)
    
    # Process files by extension
    for file_ext, files in files_by_ext.items():
        # Skip empty lists
        if not files:
            continue
        
        # Group files by directory for better logging
        files_by_dir = {}
        for file_path in files:
            dir_path = os.path.dirname(file_path)
            if dir_path not in files_by_dir:
                files_by_dir[dir_path] = []
            files_by_dir[dir_path].append(file_path)
        
        for dir_path, files in files_by_dir.items():
            # Check if we have a language parser for this file type
            parser = get_language_parser(files[0])
            
            if parser:
                # Process code files with LanguageParser
                # Use GenericLoader.from_filesystem for directory-based loading with parser
                dir_path_abs = os.path.abspath(dir_path)
                loader = GenericLoader.from_filesystem(
                    dir_path_abs,
                    glob="*",  # Match all files in directory
                    suffixes=[file_ext],  # Only files with this extension
                    parser=parser
                )
                
                try:
                    documents = loader.load()
                    
                    # Process each document and add metadata
                    for doc in documents:
                        file_path = doc.metadata.get('source')
                        rel_path = os.path.relpath(file_path, codebase_dir)
                        
                        # Add metadata to the chunk content for better context
                        content_type = doc.metadata.get('content_type', 'code')
                        language = doc.metadata.get('language', file_ext[1:])
                        
                        # Create enhanced chunk with metadata
                        enhanced_chunk = f"File: {rel_path}\nType: {content_type}\nLanguage: {language}\n\n{doc.page_content}"
                        
                        # Find or create the file entry in file_chunks
                        file_entry = next(((path, chunks) for path, chunks in file_chunks if path == file_path), None)
                        if file_entry:
                            file_entry[1].append(enhanced_chunk)
                        else:
                            file_chunks.append((file_path, [enhanced_chunk]))
                            
                    print(f"Processed {len(documents)} chunks from {len(files)} {file_ext} files in {os.path.relpath(dir_path, codebase_dir)}")
                except Exception as e:
                    print(f"Error processing {file_ext} files in {os.path.relpath(dir_path, codebase_dir)}: {e}")
            else:
                # Process other file types individually using text splitters
                for file_path in files:
                    # Get appropriate loader for the file
                    loader = get_file_loader(file_path)
                    if not loader:
                        continue
                    
                    # Load the document
                    try:
                        documents = loader.load()
                        
                        # Get appropriate text splitter
                        text_splitter = get_text_splitter(file_path)
                        
                        # Split the document into chunks
                        chunks = text_splitter.split_documents(documents)
                        
                        # Process each chunk
                        enhanced_chunks = []
                        for chunk in chunks:
                            rel_path = os.path.relpath(file_path, codebase_dir)
                            
                            # Add metadata to the chunk content
                            content_type = "text"
                            language = file_ext[1:] if file_ext else "txt"
                            
                            # Create enhanced chunk with metadata
                            enhanced_chunk = f"File: {rel_path}\nType: {content_type}\nLanguage: {language}\n\n{chunk.page_content}"
                            enhanced_chunks.append(enhanced_chunk)
                        
                        if enhanced_chunks:
                            file_chunks.append((file_path, enhanced_chunks))
                            print(f"Processed {file_path}: {len(enhanced_chunks)} chunks")
                    except Exception as e:
                        print(f"Error processing {file_path}: {e}")
    
    return file_chunks

async def process_codebase(ignore_patterns: List[str] = None) -> List[Tuple[str, List[str]]]:
    """Process the codebase and return chunks for each file."""
    if ignore_patterns is None:
        ignore_patterns = DEFAULT_IGNORE_PATTERNS
    
    file_chunks = []
    
    print(f"\n{'='*80}")
    print(f"STARTING CODEBASE PROCESSING")
    print(f"{'='*80}")
    print(f"Codebase directory: {CODEBASE_DIR}")
    print(f"Ignore patterns: {ignore_patterns}")
    
    try:
        # Get all files in the codebase directory
        all_files = []
        for root, _, files in os.walk(CODEBASE_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                all_files.append(file_path)
        
        # Filter out ignored files
        filtered_files = [
            file_path for file_path in all_files
            if not should_ignore_path(file_path, ignore_patterns)
        ]
        
        print(f"Found {len(filtered_files)} files after filtering (from {len(all_files)} total files)")
        
        # Process code files
        file_chunks = await process_code_files(filtered_files, CODEBASE_DIR)
        
        print(f"\n{'='*80}")
        print(f"CODEBASE PROCESSING COMPLETE")
        print(f"{'='*80}")
        print(f"Total files processed: {len(file_chunks)}")
        print(f"Total chunks created: {sum(len(chunks) for _, chunks in file_chunks)}")
    
    except Exception as e:
        print(f"Error processing codebase: {e}")
        import traceback
        traceback.print_exc()
    
    return file_chunks

#################
# RAG Functions #
#################

async def initialize_rag():
    """Initialize the LightRAG instance with necessary configurations."""
    # Create working directory if it doesn't exist
    if not os.path.exists(WORKING_DIR):
        os.makedirs(WORKING_DIR)
    
    # Initialize RAG with Ollama for embeddings and Gemini as LLM
    rag = LightRAG(
        working_dir=WORKING_DIR,
        embedding_func=ollama_embed,
        llm_model_func=llm_model_func,
        enable_llm_cache=False,
        # Additional parameters can be added here if needed
    )
    
    # Initialize storage and pipeline status
    await rag.initialize_storages()
    await initialize_pipeline_status()
    return rag

async def insert_chunks_into_rag(rag: LightRAG, file_chunks: List[Tuple[str, List[str]]]) -> int:
    """Insert chunks into RAG and return the number of chunks inserted."""
    total_chunks = sum(len(chunks) for _, chunks in file_chunks)
    print(f"\nInserting {total_chunks} chunks from {len(file_chunks)} files into RAG...")
    
    chunk_count = 0
    for file_path, chunks in file_chunks:
        rel_path = os.path.relpath(file_path, CODEBASE_DIR)
        try:
            for chunk in chunks:
                await rag.ainsert(chunk)
                chunk_count += 1
                if chunk_count % 10 == 0:
                    print(f"Inserted {chunk_count}/{total_chunks} chunks")
        except Exception as e:
            print(f"Error inserting chunks from {rel_path}: {e}")
    
    print(f"Successfully inserted {chunk_count} chunks.")
    return chunk_count

async def query_rag(rag: LightRAG, query: str) -> str:
    """Query the RAG system and return the response."""
    print(f"\nQuery: {query}")
    
    try:
        response = await rag.aquery(
            query,
            param=QueryParam(mode="mix")
        )
        return response
    except Exception as e:
        error_msg = f"Error querying: {e}"
        print(error_msg)
        return error_msg

####################
# Main Application #
####################

async def main():
    """Main function to demonstrate LightRAG functionality with codebase loading."""
    rag = None
    try:
        print("Initializing LightRAG...")
        rag = await initialize_rag()
        
        # Ensure codebase directory exists
        if not os.path.exists(CODEBASE_DIR):
            print(f"Codebase directory '{CODEBASE_DIR}' does not exist.")
            return
        
        # Load custom ignore patterns if .lightragignore exists
        ignore_patterns = DEFAULT_IGNORE_PATTERNS.copy()
        lightragignore_path = os.path.join(CODEBASE_DIR, '.lightragignore')
        
        if os.path.exists(lightragignore_path):
            with open(lightragignore_path, 'r') as f:
                custom_patterns = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                ignore_patterns.extend(custom_patterns)
        
        # Process files from codebase
        print(f"\nProcessing files from {CODEBASE_DIR}...")
        file_chunks = await process_codebase(ignore_patterns=ignore_patterns)
        
        if not file_chunks:
            print("No files were loaded from the codebase directory.")
            return
        
        # Insert chunks into RAG
        await insert_chunks_into_rag(rag, file_chunks)
        
        # Perform a query
        # query = "Can you explain the main functionality of this codebase?"
        query = "what does this application do? And how it works?"
        response = await query_rag(rag, query)
        print("\nResponse:")
        print(response)
        
    except Exception as e:
        print(f"An error occurred in main: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Clean up
        try:
            if rag:
                await rag.finalize_storages()
            print("\nCleanup complete.")
        except Exception as e:
            print(f"Error during cleanup: {e}")

def run_async():
    """Helper function to run async code."""
    # Create a new event loop and run the main function
    try:
        # Use asyncio.run which handles the event loop properly
        return asyncio.run(main())
    except Exception as e:
        print(f"Error in run_async: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_async()
