import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bobby:bobby2005@cluster0hack.ug01f.mongodb.net/"
const MONGODB_DB = process.env.MONGODB_DB || "bobby2005"
const MONGODB_GOV_DB = process.env.MONGODB_GOV_DB || "bobby2005"

let cachedClient: MongoClient | null = null
let cachedDb: any = null
let cachedGovDb: any = null

export async function connectToDatabase() {
  // If we have cached values, use them
  if (cachedClient && cachedDb && cachedGovDb) {
    return { client: cachedClient, db: cachedDb, govDb: cachedGovDb }
  }

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI)

    // Get the database instances
    const db = client.db(MONGODB_DB)
    const govDb = client.db(MONGODB_GOV_DB)

    // Cache the client and DBs
    cachedClient = client
    cachedDb = db
    cachedGovDb = govDb

    return { client, db, govDb }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    // Create mock databases for development/testing when MongoDB connection fails
    const mockDb = {
      collection: (name: string) => ({
        find: () => ({ toArray: async () => [] }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: "mock-id-" + Date.now() }),
        updateOne: async () => ({ matchedCount: 1 }),
        deleteOne: async () => ({ deletedCount: 1 }),
        countDocuments: async () => 0,
      }),
    }

    return {
      client: null as any,
      db: mockDb as any,
      govDb: mockDb as any,
    }
  }
}

