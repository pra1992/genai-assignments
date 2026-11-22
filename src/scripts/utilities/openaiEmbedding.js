import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_MODEL = "text-embedding-3-small";
const MODEL_DIMENSIONS = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
  "text-embedding-ada-002": 1536
};
const MAX_RETRIES = 3;

let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required. Please set it in your .env file");
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: MAX_RETRIES });
  }

  return client;
}

export function getEmbeddingModel() {
  return process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_MODEL;
}

function getDimensions() {
  const configuredDimensions = process.env.OPENAI_EMBEDDING_DIMENSIONS;
  if (!configuredDimensions) return undefined;

  const dimensions = Number(configuredDimensions);
  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new Error("OPENAI_EMBEDDING_DIMENSIONS must be a positive integer");
  }

  return dimensions;
}

export function getEmbeddingDimension() {
  const configuredDimensions = getDimensions();
  const dimensions = configuredDimensions || MODEL_DIMENSIONS[getEmbeddingModel()];
  if (!dimensions) {
    throw new Error(`Set OPENAI_EMBEDDING_DIMENSIONS for model ${getEmbeddingModel()}`);
  }
  return dimensions;
}

function getCostPerMillionTokens() {
  switch (getEmbeddingModel()) {
    case "text-embedding-3-small":
      return 0.02;
    case "text-embedding-3-large":
      return 0.13;
    case "text-embedding-ada-002":
      return 0.10;
    default:
      return 0;
  }
}

export function estimateEmbeddingCost(tokens = 0) {
  return (tokens / 1_000_000) * getCostPerMillionTokens();
}

export async function generateBatchEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("texts must be a non-empty array");
  }
  if (!texts.every(text => typeof text === "string" && text.length > 0)) {
    throw new Error("every embedding input must be a non-empty string");
  }

  const dimensions = getDimensions();
  const response = await getClient().embeddings.create({
    model: getEmbeddingModel(),
    input: texts,
    encoding_format: "float",
    ...(dimensions ? { dimensions } : {})
  });

  if (!Array.isArray(response.data) || response.data.length !== texts.length) {
    throw new Error("Invalid response from OpenAI embeddings API");
  }

  const data = [...response.data].sort((left, right) => left.index - right.index);
  if (data.some((item, index) => item.index !== index || !Array.isArray(item.embedding))) {
    throw new Error("Invalid embedding indices or vectors in OpenAI response");
  }
  const embeddings = data.map(item => item.embedding);

  return {
    embeddings,
    model: response.model,
    usage: response.usage,
    batchSize: texts.length,
    metadata: {
      model: response.model,
      totalTokens: response.usage?.total_tokens || 0,
      tokensPerInput: response.usage?.total_tokens
        ? Math.round(response.usage.total_tokens / texts.length)
        : 0,
      apiSource: "openai-batch",
      batchSize: texts.length,
      createdAt: new Date()
    }
  };
}

export async function generateEmbedding(text) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("text must be a non-empty string");
  }

  const result = await generateBatchEmbeddings([text]);
  return {
    embedding: result.embeddings[0],
    model: result.model,
    usage: result.usage,
    metadata: {
      model: result.model,
      tokens: result.usage?.total_tokens || 0,
      apiSource: "openai",
      createdAt: new Date()
    }
  };
}

export async function generateEmbeddingsChunked(texts, chunkSize = 100, onProgress = null) {
  if (!Array.isArray(texts)) {
    throw new Error("texts must be an array");
  }
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("chunkSize must be a positive integer");
  }

  const results = [];
  const totalChunks = Math.ceil(texts.length / chunkSize);

  for (let i = 0; i < texts.length; i += chunkSize) {
    const chunk = texts.slice(i, i + chunkSize);
    const chunkNumber = Math.floor(i / chunkSize) + 1;

    try {
      const result = await generateBatchEmbeddings(chunk);
      results.push(...result.embeddings.map((embedding, index) => ({
        text: chunk[index],
        embedding,
        metadata: {
          ...result.metadata,
          chunkNumber,
          indexInChunk: index,
          globalIndex: i + index
        }
      })));

      if (onProgress) {
        onProgress({
          processed: results.length,
          total: texts.length,
          chunkNumber,
          totalChunks,
          percentage: (results.length / texts.length * 100).toFixed(1)
        });
      }

      if (i + chunkSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to process embedding chunk ${chunkNumber}:`, error.message);
      for (let j = 0; j < chunk.length; j++) {
        results.push({
          text: chunk[j],
          embedding: null,
          error: error.message,
          metadata: {
            chunkNumber,
            indexInChunk: j,
            globalIndex: i + j,
            failed: true
          }
        });
      }
    }
  }

  return results;
}

export async function testConnection() {
  const result = await generateEmbedding("test");
  console.log("OpenAI embeddings API connection successful");
  console.log(`Model: ${result.model}`);
  console.log(`Embedding dimension: ${result.embedding.length}`);
  return true;
}

export default {
  generateEmbedding,
  generateBatchEmbeddings,
  generateEmbeddingsChunked,
  getEmbeddingDimension,
  getEmbeddingModel,
  estimateEmbeddingCost,
  testConnection
};
