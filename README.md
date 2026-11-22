# RAG MongoDB Demo - Backend API

Backend-only API for storing and retrieving test cases with MongoDB Atlas Vector Search.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account with Vector Search enabled
- API keys for OpenAI and Groq

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `OPENAI_API_KEY` - OpenAI API key for embeddings
- `OPENAI_EMBEDDING_MODEL` - Embedding model (defaults to `text-embedding-3-small`)
- `GROQ_API_KEY` - Groq API key for LLM operations
- Database and collection names
- Index names for BM25 and Vector search

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in .env)

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### File Management
- `GET /api/files` - List all JSON files in data directory
- `POST /api/upload-excel` - Upload and convert Excel files to JSON

### Embeddings
- `POST /api/create-embeddings` - Create embeddings for selected files
- `POST /api/create-embeddings-batch` - Batch create embeddings (faster)

### Search
- `POST /api/search` - Vector search
- `POST /api/search/bm25` - BM25 keyword search
- `POST /api/search/hybrid` - Hybrid search (BM25 + Vector)
- `POST /api/search/rerank` - Score fusion with reranking

### Query Processing
- `POST /api/search/preprocess` - Preprocess query (normalization, synonyms)
- `POST /api/search/analyze` - Analyze query without applying changes

### Results Processing
- `POST /api/search/deduplicate` - Deduplicate search results
- `POST /api/search/summarize` - Summarize results using AI

### Metadata
- `GET /api/metadata/distinct` - Get distinct values for filters

### Settings
- `GET /api/env` - Get environment variables
- `POST /api/env` - Update environment variables

### Jobs
- `GET /api/jobs/active` - Get active background jobs
- `GET /api/jobs/:jobId` - Get job status

### Testing
- `POST /api/test-prompt` - Test AI prompts

## 🗂️ Project Structure

```
├── server/
│   └── index.js              # Express server and API routes
├── src/
│   ├── config/               # Index configurations
│   ├── data/                 # JSON data files
│   ├── scripts/
│   │   ├── data-conversion/  # Excel to JSON converters
│   │   ├── embeddings/       # Embedding generation scripts
│   │   ├── query-preprocessing/ # Query processing utilities
│   │   ├── search/           # Search implementations
│   │   └── utilities/        # Helper functions
├── uploads/                  # Uploaded files directory
├── releases/                 # Release documentation
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
└── package.json              # Dependencies and scripts
```

## 🔧 Backend Technologies

- **Express.js** - Web framework
- **MongoDB Atlas** - Vector database with Atlas Search
- **OpenAI** - Embedding generation
- **Groq** - LLM operations (summarization, reranking)
- **Multer** - File upload handling
- **XLSX** - Excel file processing

## 📝 Environment Variables

Required variables in `.env`:

```env
# Server
PORT=3001

# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
COLLECTION_NAME=your_collection_name

# Search Indexes
VECTOR_INDEX_NAME=vector_index
BM25_INDEX_NAME=bm25_index

# API Keys
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
# Optional. The default model produces 1536-dimensional embeddings.
# OPENAI_EMBEDDING_DIMENSIONS=1536
GROQ_API_KEY=your_groq_api_key

# Models
GROQ_RERANK_MODEL=llama-3.2-3b-preview
GROQ_SUMMARIZATION_MODEL=llama-3.3-70b-versatile
```

The Atlas vector-search index dimensions must match the configured embedding dimensions. The provided index templates use 1536 for the default OpenAI model. After switching providers or changing models/dimensions, recreate the Atlas vector index and regenerate stored embeddings before searching; vectors from different embedding models are not interchangeable.

## 🧪 Testing the API

Use curl, Postman, or any HTTP client:

```bash
# Health check
curl http://localhost:3001/api/health

# Vector search
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "login functionality", "limit": 5}'

# BM25 search
curl -X POST http://localhost:3001/api/search/bm25 \
  -H "Content-Type: application/json" \
  -d '{"query": "user authentication", "limit": 5}'
```

## 🚨 Important Notes

- The `client/` folder has been removed - this is now a backend-only API
- Frontend applications should connect to this API via HTTP requests
- CORS is enabled for cross-origin requests
- File uploads are stored in the `uploads/` directory
- Temporary conversion scripts are auto-cleaned after execution

## 📦 Dependencies

All frontend dependencies have been removed. Only backend dependencies remain:
- express
- mongodb
- cors
- multer
- dotenv
- axios
- groq-sdk
- openai
- xlsx
- And other backend utilities

## 🔄 Migration from Full-Stack

If you previously had the React frontend:
1. The backend API remains unchanged
2. All routes and functionality are preserved
3. Build a new frontend that consumes these API endpoints
4. Or use API testing tools like Postman for direct interaction

## 📚 Additional Resources

- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)

## 🤝 Support

For issues or questions, refer to the release documentation in the `releases/` folder.
