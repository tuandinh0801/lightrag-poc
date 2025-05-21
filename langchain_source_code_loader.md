# Source Code

This notebook covers how to load source code files using a special approach with language parsing: each top-level function and class in the code is loaded into separate documents. Any remaining top-level code outside the already loaded functions and classes will be loaded into a separate document.

This approach can potentially improve the accuracy of QA models over source code.

The supported languages for code parsing are:
- C (*)
- C++ (*)
- C# (*)
- COBOL
- Elixir
- Go (*)
- Java (*)
- JavaScript (requires package esprima)
- Kotlin (*)
- Lua (*)
- Perl (*)
- Python
- Ruby (*)
- Rust (*)
- Scala (*)
- TypeScript (*)

Items marked with (*) require the packages `tree_sitter` and `tree_sitter_languages`.  
It is straightforward to add support for additional languages using tree_sitter, although this currently requires modifying LangChain.

The language used for parsing can be configured, along with the minimum number of lines required to activate the splitting based on syntax. If a language is not explicitly specified, `LanguageParser` will infer one from filename extensions, if present.

To install the required packages:
```bash
%pip install -qU esprima tree_sitter tree_sitter_languages
```

Example usage:
```python
import warnings
warnings.filterwarnings("ignore")
from pprint import pprint
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import Language

loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py", ".js"],
    parser=LanguageParser(),
)
docs = loader.load()
```

Check the number of documents:
```python
len(docs)  # Output: 6
```

Inspect document metadata:
```python
for document in docs:
    pprint(document.metadata)
```
Example output:
```
{'content_type': 'functions_classes', 'language': <Language.PYTHON: 'python'>, 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes', 'language': <Language.PYTHON: 'python'>, 'source': 'example_data/source_code/example.py'}
{'content_type': 'simplified_code', 'language': <Language.PYTHON: 'python'>, 'source': 'example_data/source_code/example.py'}
{'content_type': 'functions_classes', 'language': <Language.JS: 'js'>, 'source': 'example_data/source_code/example.js'}
{'content_type': 'functions_classes', 'language': <Language.JS: 'js'>, 'source': 'example_data/source_code/example.js'}
{'content_type': 'simplified_code', 'language': <Language.JS: 'js'>, 'source': 'example_data/source_code/example.js'}
```

Print the contents:
```python
print("\n\n--8<--\n\n".join([document.page_content for document in docs]))
```

Example output:
```python
class MyClass:
    def __init__(self, name):
        self.name = name
    def greet(self):
        print(f"Hello, {self.name}!")
--8<--
def main():
    name = input("Enter your name: ")
    obj = MyClass(name)
    obj.greet()
--8<--
# Code for: class MyClass:
# Code for: def main():
if __name__ == "__main__":
    main()
--8<--
class MyClass {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(`Hello, ${this.name}!`);
  }
}
--8<--
function main() {
  const name = prompt("Enter your name:");
  const obj = new MyClass(name);
  obj.greet();
}
--8<--
// Code for: class MyClass {
// Code for: function main() {
main();
```

The parser can be disabled for small files using the `parser_threshold` parameter:
```python
loader = GenericLoader.from_filesystem(
    "./example_data/source_code",
    glob="*",
    suffixes=[".py"],
    parser=LanguageParser(language=Language.PYTHON, parser_threshold=1000),
)
docs = loader.load()
print(docs[0].page_content)
```

---

## Splitting

Additional splitting could be needed for those functions, classes, or scripts that are too big.

```python
from langchain_text_splitters import (
    Language,
    RecursiveCharacterTextSplitter,
)

js_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.JS, chunk_size=60, chunk_overlap=0
)
result = js_splitter.split_documents(docs)
print("\n\n--8<--\n\n".join([document.page_content for document in result]))
```

---