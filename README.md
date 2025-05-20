# LightRAG POC

This is a simple Proof of Concept (POC) demonstrating the LightRAG library for Retrieval-Augmented Generation with codebase loading functionality. The POC can load and process files from a codebase directory, split them into chunks based on file type, and make them available for querying through the RAG system.

## Prerequisites

- Python 3.8+
- Google API key for Gemini
- Ollama installed and running locally
- Nomic Embed Text model installed in Ollama (run: `ollama pull nomic-embed-text`)
- A codebase directory to analyze (optional, can use the default sample codebase)

## Setup

1. Clone this repository
2. Install [uv](https://github.com/astral-sh/uv) if you haven't already:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```
   Or install via pip:
   ```bash
   pip install uv
   ```
3. Create and activate a virtual environment with uv:
   ```bash
   # Create virtual environment
   uv venv
   
   # Activate the environment
   # On macOS/Linux:
   source .venv/bin/activate
   # On Windows:
   # .venv\Scripts\activate
   ```
4. Install dependencies using uv:
   ```bash
   uv pip install -r requirements.txt
   ```
5. Create a `.env` file in the project root and add your Google API key and codebase directory path:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   CODEBASE_DIR=/path/to/your/codebase
   ```
   If `CODEBASE_DIR` is not specified, it will default to `./codebase`
6. Install the required Ollama model:
   ```bash
   ollama pull nomic-embed-text
   ```

## Running the POC

Run the POC script:
```bash
python lightrag_poc.py
```

The script will:
1. Initialize LightRAG
2. Load files from the specified codebase directory
3. Process files using appropriate loaders based on file type
4. Split content into chunks using file type-specific splitters
5. Insert chunks into the RAG system
6. Perform a query about the codebase functionality
7. Display the response

## How It Works

The POC demonstrates the core functionality of LightRAG with codebase loading:

- **File Loading**: Uses langchain document loaders to load different file types (Python, JSON, Markdown, CSV, and plain text)
- **File Type Detection**: Automatically selects the appropriate loader based on file extension
- **Ignore Patterns**: Supports gitignore-like functionality with default patterns and custom `.lightragignore` file
- **Text Splitting**: Uses specialized text splitters for different file types to create optimal chunks
- **Context Preservation**: Adds file path information to each chunk for better context
- **Document Ingestion**: Processes and stores chunks in the RAG system
- **Vector Embeddings**: Generates embeddings using Ollama's nomic-embed-text model
- **Semantic Search**: Performs hybrid search combining vector similarity and knowledge graph
- **Response Generation**: Uses Gemini LLM to generate responses based on retrieved context

## Customization

### Codebase Directory

You can specify a different codebase directory by setting the `CODEBASE_DIR` environment variable in your `.env` file:

```
CODEBASE_DIR=/path/to/your/codebase
```

### Ignore Patterns

You can create a `.lightragignore` file in your codebase directory to specify additional patterns to ignore. The syntax is similar to `.gitignore`:

```
# Example .lightragignore file
**/tests/**
**/build/**
**/dist/**
*.log
```

### Chunk Size and Overlap

You can modify the chunk size and overlap in the `get_text_splitter` function in `lightrag_poc.py`:

```python
# Define chunk sizes and overlap for different file types
chunk_size = 1000  # Increase or decrease as needed
chunk_overlap = 200  # Increase or decrease as needed
```

### Query

You can modify the query in the `main` function to ask different questions about your codebase:

```python
# Perform a query
query = "What are the main design patterns used in this codebase?"
```
