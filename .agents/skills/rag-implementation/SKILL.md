---
name: rag-implementation
description: Designs and implements production-ready Retrieval-Augmented Generation architectures, chunking strategies, vector database embeddings, and hybrid keyword-semantic search. Use when building documentation search, codebase knowledge retrieval, or contextual agent memory.
---

# RAG Implementation Skill

Architectural patterns for production-grade Retrieval-Augmented Generation (RAG) systems targeting codebases and security documentation.

## 1. Codebase Chunking Strategies

- **AST-Aware Chunking**: Do not split code on arbitrary token or line counts. Split along AST boundaries (functions, classes, route declarations).
- **Metadata Enrichment**: Tag each chunk with filepath, language, enclosing module/class, and export signature.

```python
# AST Chunk Metadata Schema
{
  "chunk_id": "auth_controller_login_84_112",
  "file_path": "controllers/auth.py",
  "symbol_name": "login",
  "symbol_type": "function",
  "code": "async def login(...): ...",
  "dependencies": ["generate_jwt", "verify_password"]
}
```

## 2. Hybrid Retrieval (BM25 + Semantic Embeddings)

Pure vector semantic search often misses exact variable names, error codes, and endpoint strings.
- **Dense Vector Search**: Captures high-level intent, functional similarity, and synonyms.
- **Sparse BM25 Search**: Matches exact symbols (e.g. `JWT_SECRET`, `/api/v1/projects`).
- **Reciprocal Rank Fusion (RRF)**: Re-rank combined results from dense and sparse retrieval before injecting into context.

## 3. Reranking & Context Compression

Pass top-50 hybrid candidates through a cross-encoder reranker to select the top 5 most relevant snippets, reducing context contamination and token cost.

