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

# Gemini LLM Function
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
            # Use TextLoader for Markdown files to avoid unstructured dependency issues
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

def get_text_splitter(file_path: str) -> Any:
    """Get the appropriate text splitter for a file based on its extension."""
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Define chunk sizes and overlap for different file types
    chunk_size = 1000
    chunk_overlap = 200
    
    # Map file extensions to their respective splitters
    if file_ext == ".py":
        return PythonCodeTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    elif file_ext == ".md":
        return MarkdownTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    elif file_ext == ".json":
        # Use default recursive character splitter for JSON files
        return RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    
    # Default recursive character splitter
    return RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)

async def load_codebase_files(codebase_dir: str, ignore_patterns: List[str] = None) -> List[Tuple[str, List[str]]]:
    """
    Load and split files from the codebase directory.
    
    Returns:
        List of tuples containing (file_path, chunks)
    """
    if ignore_patterns is None:
        ignore_patterns = DEFAULT_IGNORE_PATTERNS
    
    # Get all files in the codebase directory
    all_files = []
    for root, _, files in os.walk(codebase_dir):
        for file in files:
            file_path = os.path.join(root, file)
            all_files.append(file_path)
    
    # Filter out ignored files
    files_to_process = [
        file_path for file_path in all_files 
        if not should_ignore_path(file_path, ignore_patterns)
    ]
    
    file_chunks = []
    
    for file_path in files_to_process:
        try:
            # Get appropriate loader for the file
            loader = get_file_loader(file_path)
            if not loader:
                continue
            
            # Load the document
            documents = loader.load()
            
            # Get appropriate splitter for the file
            splitter = get_text_splitter(file_path)
            
            # Split the document into chunks
            chunks = splitter.split_documents(documents)
            
            # Extract text from chunks
            text_chunks = [chunk.page_content for chunk in chunks]
            
            # Add relative path as prefix to each chunk for better context
            rel_path = os.path.relpath(file_path, codebase_dir)
            prefixed_chunks = [f"File: {rel_path}\n\n{chunk}" for chunk in text_chunks]
            
            file_chunks.append((file_path, prefixed_chunks))
            print(f"Processed {rel_path}: {len(prefixed_chunks)} chunks")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return file_chunks

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
        
        # Load and process files from codebase
        print(f"\nLoading files from codebase directory: {CODEBASE_DIR}")
        file_chunks = await load_codebase_files(CODEBASE_DIR, ignore_patterns)
        
        if not file_chunks:
            print("No files were loaded from the codebase directory.")
            return
        
        # Insert chunks into RAG
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
        
        # Perform a query
        # query = "Can you explain the main functionality of this codebase?"
        query = "what are the configs using for?"
        print(f"\nQuery: {query}")
        
        # Get response using hybrid search
        try:
            response = await rag.aquery(
                query,
                param=QueryParam(mode="mix")
            )
            print("\nResponse:")
            print(response)
        except Exception as e:
            print(f"Error querying: {e}")
        
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
