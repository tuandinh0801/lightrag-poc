"""
RAG functions for LightRAG POC.
"""

import os
from typing import List, Dict, Optional
from lightrag import LightRAG, QueryParam, StorageType
from lightrag.kg.shared_storage import initialize_pipeline_status

async def initialize_rag(
    working_dir: str, 
    embedding_func, 
    llm_model_func, 
    neo4j_uri: Optional[str] = None,
    neo4j_username: Optional[str] = None,
    neo4j_password: Optional[str] = None,
    redis_url: Optional[str] = None,
    postgres_url: Optional[str] = None,
    google_api_key: Optional[str] = None
):
    """Initialize the LightRAG instance with necessary configurations.
    
    Args:
        working_dir: Directory to store RAG data
        embedding_func: Function to generate embeddings
        llm_model_func: Function to generate LLM responses
        neo4j_uri: URI for Neo4j graph database (e.g., 'bolt://localhost:7687')
        neo4j_username: Username for Neo4j
        neo4j_password: Password for Neo4j
        redis_url: URL for Redis key-value store (e.g., 'redis://localhost:6379')
        postgres_url: URL for PostgreSQL database (e.g., 'postgresql://user:pass@localhost:5432/db')
        google_api_key: API key for Google services (if needed)
        
    Returns:
        Initialized LightRAG instance
    """
    # Create working directory if it doesn't exist
    if not os.path.exists(working_dir):
        os.makedirs(working_dir)
    
    # Configure storage backends
    storage_config = {}
    
    # Configure Neo4j for graph storage if credentials provided
    if neo4j_uri and neo4j_username and neo4j_password:
        storage_config[StorageType.GRAPH] = {
            "type": "neo4j",
            "uri": neo4j_uri,
            "username": neo4j_username,
            "password": neo4j_password
        }
    
    # Configure Redis for key-value storage if URL provided
    if redis_url:
        storage_config[StorageType.KV] = {
            "type": "redis",
            "url": redis_url
        }
    
    # Configure PostgreSQL for document status storage and vector storage if URL provided
    if postgres_url:
        # For document status storage
        storage_config[StorageType.DOCUMENT_STATUS] = {
            "type": "postgres",
            "url": postgres_url
        }
        
        # For vector storage (using pgvector)
        storage_config[StorageType.VECTOR] = {
            "type": "pgvector",
            "url": postgres_url
        }
    
    # Initialize RAG with configured storage backends
    rag = LightRAG(
        working_dir=working_dir,
        embedding_func=embedding_func,
        llm_model_func=llm_model_func,
        enable_llm_cache=False,  # for testing
        storage_config=storage_config if storage_config else None
    )
    
    # Initialize storage and pipeline status
    await rag.initialize_storages()
    await initialize_pipeline_status()
    return rag

async def insert_chunks_into_rag(rag: LightRAG, chunks: List[Dict[str, str]]) -> int:
    """Insert chunks into RAG and return the number of chunks inserted."""
    print(f"\nInserting {len(chunks)} chunks into RAG...")
    
    # Perform bulk insertion of all chunks at once with their file paths
    if chunks:
        # Extract content and file paths for each chunk
        contents = [chunk['content'] for chunk in chunks]
        file_paths = [chunk['file_path'] for chunk in chunks]
        
        # Use apipeline_enqueue_documents to include file paths
        await rag.apipeline_enqueue_documents(contents, file_paths=file_paths)
    
    print(f"Successfully inserted {len(chunks)} chunks.")

    await rag.apipeline_process_enqueue_documents()

    print(f"Successfully processed {len(chunks)} chunks.")
    
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
