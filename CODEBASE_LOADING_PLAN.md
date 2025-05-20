# LightRAG Codebase Loading Implementation Plan

## Overview

This document outlines the plan for upgrading the LightRAG Proof of Concept (POC) to load and process codebase files instead of sample text. The implementation uses langchain for file loading and text splitting, with support for ignoring unnecessary files and directories.

## Requirements

1. Load codebase from a directory specified via environment variable
2. Use langchain loaders for different file types (Python, JSON, Markdown, CSV, etc.)
3. Implement file/folder ignoring similar to gitignore
4. Use file type-specific text splitters to create chunks
5. Process and insert these chunks into the RAG system

## Implementation Steps

### 1. Add Required Dependencies

Update the `requirements.txt` file to include:
- `langchain`
- `langchain-text-splitters`
- `langchain-community`

```bash
pip install -r requirements.txt
```

### 2. Configure Codebase Directory

The system reads the codebase directory from the `CODEBASE_DIR` environment variable, defaulting to `./codebase` if not specified. Set this in your `.env` file or export it before running:

```bash
export CODEBASE_DIR=/path/to/your/codebase
```

### 3. File Ignoring System

#### Default Ignore Patterns

The system includes default ignore patterns for common files and directories that should be excluded:

```python
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
```

#### Custom Ignore Patterns

Create a `.lightragignore` file in your codebase directory to specify additional patterns to ignore:

```
# Example .lightragignore file
**/tests/**
**/build/**
**/dist/**
```

### 4. File Loading and Processing

The system uses the following file type-specific loaders:

| File Extension | Loader |
|----------------|--------|
| .py | PythonLoader |
| .json | JSONLoader |
| .md | UnstructuredMarkdownLoader |
| .csv | CSVLoader |
| others | TextLoader |

### 5. Text Splitting

The system uses specialized text splitters for different file types:

| File Type | Splitter |
|-----------|----------|
| Python | PythonCodeTextSplitter |
| Markdown | MarkdownTextSplitter |
| JSON | RecursiveCharacterTextSplitter (JSON) |
| Others | RecursiveCharacterTextSplitter |

Default chunk sizes:
- Chunk size: 1000 characters
- Chunk overlap: 200 characters

### 6. RAG Integration Process

1. Files are loaded using appropriate loaders
2. Content is split using file type-specific splitters
3. Each chunk is prefixed with its file path for better context
4. Chunks are inserted into the RAG system

## Usage

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set the codebase directory:
   ```bash
   # In .env file
   CODEBASE_DIR=/path/to/your/codebase
   ```

3. Optionally create a `.lightragignore` file in your codebase directory

4. Run the script:
   ```bash
   python lightrag_poc.py
   ```

## Expected Output

The script will:
1. Initialize the LightRAG system
2. Scan the codebase directory for files (respecting ignore patterns)
3. Process each file with the appropriate loader and splitter
4. Insert chunks into the RAG system
5. Perform a sample query to demonstrate functionality

Example output:
```
Initializing LightRAG...

Loading files from codebase directory: /path/to/your/codebase
Processed src/main.py: 3 chunks
Processed src/utils.py: 2 chunks
Processed README.md: 1 chunks

Inserting 6 chunks from 3 files into RAG...
Inserted 6/6 chunks
Successfully inserted 6 chunks.

Query: Can you explain the main functionality of this codebase?

Response:
[LLM response explaining the codebase]
```

## Troubleshooting

### Common Issues

1. **File loading errors**: Check if the file exists and is readable
2. **JSONLoader errors**: Ensure JSON files are valid and properly formatted
3. **Permission issues**: Verify file permissions for the codebase directory

### Debug Tips

- Enable more verbose logging by changing `level="INFO"` to `level="DEBUG"` in `setup_logger`
- Check the `lightrag.log` file for detailed logs

## Future Improvements

1. Add support for more file types (e.g., YAML, HTML, JavaScript)
2. Implement parallel processing for faster loading of large codebases
3. Add metadata extraction for better context (e.g., function names, class definitions)
4. Add command-line arguments for easier configuration
5. Implement caching to avoid reprocessing unchanged files
