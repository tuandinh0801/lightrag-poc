"""
Embedding functions for LightRAG POC.
"""

import asyncio
import ollama
from typing import List, Dict, Any, Optional

async def ollama_embed(
    texts: List[str],
    model: str = "mxbai-embed-large",
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
            return [0.0] * 1024
    
    # Process embeddings concurrently
    tasks = [get_embedding(text) for text in texts]
    return await asyncio.gather(*tasks)

# Add embedding dimension attribute
ollama_embed.embedding_dim = 1024  # Standard dimension for mxbai-embed-large


# Add others embedding functions here