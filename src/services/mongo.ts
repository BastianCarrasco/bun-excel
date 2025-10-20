import { MongoClient, Db } from "mongodb";

let db: Db;

export const connectToMongo = async () => {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Falta MONGODB_URI en .env");

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db("CARTERA");
  console.log("✅ Conectado a MongoDB:", db.databaseName);

  return db;
};
