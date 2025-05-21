# LightRAG POC

A modular and extensible Proof of Concept (POC) for the LightRAG library, demonstrating Retrieval-Augmented Generation (RAG) with advanced codebase processing capabilities. The application is now structured into focused modules for better maintainability and extensibility.

## 🚀 Features

- **Modular Architecture**: Organized into focused modules for different concerns
- **Smart Code Processing**: Language-aware processing with specialized loaders and splitters
- **Efficient Chunking**: Preserves code structure and context in document chunks
- **Hybrid Search**: Combines vector similarity with knowledge graph for better retrieval
- **Extensible Design**: Easy to add new file types or processing pipelines

## 📋 Prerequisites

- Python 3.8+
- Google API key for Gemini
- Ollama installed and running locally
- Nomic Embed Text model (`ollama pull nomic-embed-text`)

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lightrag-poc.git
   cd lightrag-poc
   ```

2. **Set up the environment**
   ```bash
   # Create and activate virtual environment
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Install Ollama model
   ollama pull nomic-embed-text
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and update with your settings:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` to set:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   CODEBASE_DIR=./codebase  # Path to your codebase
   ```

## 🏃‍♂️ Running the Application

Run the main script:
```bash
python main.py
```

Or import and use the modules in your code:
```python
from lightrag_poc.rag import RAGSystem
from lightrag_poc.codebase_processor import CodebaseProcessor
from lightrag_poc.embeddings import get_embeddings

# Initialize components
embeddings = get_embeddings()
rag = RAGSystem(embeddings)
processor = CodebaseProcessor()

# Process codebase and query
processor.process_codebase()
rag.ingest_documents(processor.documents)
response = rag.query("What are the main components of this codebase?")
print(response)
```

## 🏗️ Project Structure

```
lightrag_poc/
├── __init__.py          # Package initialization
├── codebase_processor.py # Codebase processing logic
├── config.py            # Configuration settings
├── embeddings.py        # Embedding model management
├── file_helpers.py      # File utilities and helpers
├── llm.py              # LLM integration
├── main.py             # Main application entry point
└── rag.py              # Core RAG functionality
```

## 🛠 Customization

### Adding New File Types

1. Add a new loader in `codebase_processor.py`
2. Update `get_loader` and `get_text_splitter` methods
3. Add appropriate file extensions to the `FILE_LOADERS` dictionary

### Configuration

Modify `config.py` for:
- Default file patterns
- Chunk sizes and overlaps
- Model parameters
- Logging configuration

## 📚 Documentation

- [LightRAG Documentation](LightRAG_document.md)
- [Codebase Loading Plan](CODEBASE_LOADING_PLAN.md)
- [LangChain Integration](langchain_source_code_loader.md)

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
