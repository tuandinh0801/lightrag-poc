"""
Main application for LightRAG POC.
"""

import os
import asyncio
import traceback
from lightrag.utils import setup_logger

from lightrag_poc.config import WORKING_DIR, CODEBASE_DIR, GOOGLE_API_KEY, DEFAULT_IGNORE_PATTERNS
from lightrag_poc.embeddings import ollama_embed
from lightrag_poc.llm import llm_model_func
from lightrag_poc.codebase_processor import process_codebase_by_directory
from lightrag_poc.rag import initialize_rag, insert_chunks_into_rag, query_rag

# Set up logger
setup_logger("lightrag", level="INFO")

async def main():
    """Main function to demonstrate LightRAG functionality with codebase loading."""
    rag = None
    try:
        print("Initializing LightRAG...")
        
        # Create a wrapper for llm_model_func that includes the API key
        async def llm_func_with_api_key(*args, **kwargs):
            kwargs['api_key'] = GOOGLE_API_KEY
            return await llm_model_func(*args, **kwargs)
        
        rag = await initialize_rag(
            working_dir=WORKING_DIR,
            embedding_func=ollama_embed,
            llm_model_func=llm_func_with_api_key
        )
        
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
        
        # Process files from codebase using directory-based approach
        print(f"\nProcessing files from {CODEBASE_DIR}...")
        all_chunks = await process_codebase_by_directory(CODEBASE_DIR, ignore_patterns=ignore_patterns)
        
        if not all_chunks:
            print("No files were loaded from the codebase directory.")
            return

        # Write chunks to file for testing
        with open("chunks.txt", "w") as f:
            for chunk in all_chunks:
                f.write(chunk + "\n")
        
        # Insert chunks into RAG
        # Comment to test chunks first
        await insert_chunks_into_rag(rag, all_chunks)
        
        # Perform a query
        query = "Can you explain the main functionality of this codebase?"
        response = await query_rag(rag, query)
        print("\nResponse:")
        print(response)
        
    except Exception as e:
        print(f"An error occurred in main: {e}")
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
        traceback.print_exc()
