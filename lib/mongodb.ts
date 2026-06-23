import mongoose, { Connection } from 'mongoose';

/**
 * Mongoose connection cache type definition.
 * Prevents TypeScript errors when accessing global object properties.
 */
interface MongooseConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Global cache for Mongoose connection.
 * In development, prevents multiple connections during hot reloads.
 * In production, reuses the established connection across requests.
 */
declare global {
  var mongooseCache: MongooseConnection | undefined;
}

/**
 * Initialize the global cache if it doesn't exist.
 * This ensures we have a consistent cache object throughout the application lifecycle.
 */
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

/**
 * Connects to MongoDB using Mongoose with optimized connection pooling.
 * The connection is cached to prevent multiple connections during development
 * and to ensure efficient connection reuse in production.
 *
 * @returns Promise<Connection> - The Mongoose database connection
 * @throws Error if connection string is not defined or connection fails
 */
async function connectDB(): Promise<Connection> {
  // Return existing connection if already established
  if (cached!.conn) {
    return cached!.conn;
  }

  // Return pending promise if connection is in progress
  if (cached!.promise) {
    return cached!.promise;
  }

  // Ensure MongoDB URI is configured
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      'MONGODB_URI environment variable is not defined. Please configure your MongoDB connection string.'
    );
  }
    const options = {
        bufferCommands: false, // Disable Mongoose buffering
    };

  console.log("Mongo URI:", mongoUri.split("@")[1]);

  // Create a new connection promise
  const connectionPromise = mongoose
    .connect(mongoUri, {
      /**
       * Connection pool configuration optimized for Next.js:
       * - maxPoolSize: 5-10 connections for typical Next.js workloads
       * - minPoolSize: 1 for efficient resource usage during development
       * - Adjust based on your application's concurrency requirements
       */
      maxPoolSize: 10,
      minPoolSize: 2,

      /**
       * Timeout configurations:
       * - connectTimeoutMS: Fail fast if initial connection cannot be established
       * - socketTimeoutMS: Prevent hanging operations and cleanup stale connections
       */
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,

      /**
       * Connection pool idle timeout:
       * Automatically close connections that haven't been used for this duration.
       * Helps prevent connection exhaustion in idle periods.
       */
      maxIdleTimeMS: 30000,

      /**
       * Server selection timeout:
       * Time to wait for server discovery and selection during connection attempts
       */
      serverSelectionTimeoutMS: 5000,

      /**
       * Family preference for IPv4 connections
       * Set to 4 for IPv4 only (recommended for stability)
       */
      family: 4,
    })
    .then((mongooseInstance) => {
      // Return the default connection from the connected instance
      console.log("MongoDB Connected Successfully");
      return mongooseInstance.connection;
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err);
      throw err;
    });

  // Cache the connection promise to avoid multiple simultaneous connection attempts
  cached!.promise = connectionPromise;

  try {
    // Await the connection and cache the result
    cached!.conn = await connectionPromise;
    return cached!.conn;
  } catch (error) {
    // Clear the promise cache on failure to allow retry attempts
    cached!.promise = null;
    throw error;
  }
}

// Export the connectDB function for use throughout the application
export default connectDB;
