import { MongoClient } from "mongodb";
import dns from "dns";
import { generateEmbedding } from "../utilities/openaiEmbedding.js";
import dotenv from "dotenv";

dotenv.config();

// Fix DNS resolution issue on macOS by using Google's DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

const client = new MongoClient(process.env.MONGODB_URI);

async function main() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    // Take query from command line args, default if missing
    const query = process.argv[2] || "login tests";

    console.log(`🔎 Searching for: "${query}"`);
    console.log(`🔄 Getting embedding from OpenAI...`);
    const embeddingResult = await generateEmbedding(query);
    const queryVector = embeddingResult.embedding;
    console.log(`✅ Embedding generated! Model: ${embeddingResult.model}`);

    // Vector search pipeline
    const pipeline = [
      {
        $vectorSearch: {
          queryVector,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
          index: process.env.VECTOR_INDEX_NAME  // must match Atlas Search index name
        }
      },
      {
        $project: {
          testcase_id: 1,
          title: 1,
          description: 1,
          steps: 1,
          expectedResult: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    console.log("\n✅ Search results:");
    console.table(results);
    
    console.log(`📈 Model Used: ${embeddingResult.model}`);
    console.log(`🔢 Results Found: ${results.length}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

main();
