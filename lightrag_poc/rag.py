"""
RAG functions for LightRAG POC.
"""

import os
from typing import List
from lightrag import LightRAG, QueryParam
from lightrag.kg.shared_storage import initialize_pipeline_status

async def initialize_rag(working_dir: str, embedding_func, llm_model_func, google_api_key: str = None):
    """Initialize the LightRAG instance with necessary configurations."""
    # Create working directory if it doesn't exist
    if not os.path.exists(working_dir):
        os.makedirs(working_dir)
    
    # Initialize RAG with Ollama for embeddings and Gemini as LLM
    rag = LightRAG(
        working_dir=working_dir,
        embedding_func=embedding_func,
        llm_model_func=llm_model_func,
        enable_llm_cache=False, # for testing
        # Additional parameters can be added here if needed
    )
    
    # Initialize storage and pipeline status
    await rag.initialize_storages()
    await initialize_pipeline_status()
    return rag

async def insert_chunks_into_rag(rag: LightRAG, chunks: List[str]) -> int:
    """Insert chunks into RAG and return the number of chunks inserted."""
    print(f"\nInserting {len(chunks)} chunks into RAG...")
    
    # Perform bulk insertion of all chunks at once
    if chunks:
        await rag.ainsert(chunks)
    
    print(f"Successfully inserted {len(chunks)} chunks.")
    return len(chunks)

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
