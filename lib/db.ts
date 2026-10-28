import mongoose from "mongoose";
const globalDb = globalThis as typeof globalThis & {
  mongoPromise?: Promise<typeof mongoose>;
};
export async function connectDB() {
  if (!process.env.MONGODB_URI)
    throw new Error("Database not configured. Add MONGODB_URI to .env.local.");
  if (!globalDb.mongoPromise)
    globalDb.mongoPromise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((error) => {
        globalDb.mongoPromise = undefined;
        throw error;
      });
  return globalDb.mongoPromise;
}
