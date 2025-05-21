"""
Configuration settings for LightRAG POC.
"""

import os
from dotenv import dotenv_values

# Load environment variables
config = dotenv_values(".env")

# Configuration
WORKING_DIR = "./rag_storage"
CODEBASE_DIR = config.get('CODEBASE_DIR', './codebase')

# Google API key for Gemini
GOOGLE_API_KEY = config.get('GOOGLE_API_KEY')

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
