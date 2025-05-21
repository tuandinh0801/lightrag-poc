"""
LLM integration for LightRAG POC.
"""

from typing import List, Dict, Any, Optional
from lightrag.llm.openai import openai_complete_if_cache

async def llm_model_func(
    prompt, system_prompt=None, history_messages=[], keyword_extraction=False, **kwargs
) -> str:
    """
    LLM model function that integrates with LightRAG.
    Uses Gemini model through OpenAI-compatible API.
    """
    return await openai_complete_if_cache(
        model="gemini-2.0-flash",
        prompt=prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai",
        **kwargs
    )
