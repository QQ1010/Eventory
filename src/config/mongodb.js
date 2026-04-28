import { MongoClient } from "mongodb";
const mongoUrl = process.env.MONGO_RUL ?? "mongodb://localhost:27017";
const databaseName = process.env.MONGO_DB_NAME ?? "eventory";
let client;
let db;
export async function connectDatabase() {
    if (db) {
        return db;
    }
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(databaseName);
    return db;
}
//# sourceMappingURL=mongodb.js.map