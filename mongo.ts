import { MongoClient, ServerApiVersion } from "mongodb";

// Define a URI string for MongoDB connection
const uri: string = "mongodb://rick:123456@52.184.80.174:27017/?authMechanism=DEFAULT";




export async function isValid(username:string) {
  try {
    await client.connect();
    const db = client.db("Canvas");
    const collection = db.collection("users");

    const user = await collection.findOne({ username: username });
    return user;
  } catch (error) {
    console.error("An error occurred while checking if username is valid:", error);
    return false;
  } finally {
    await client.close();
  }
}
// // Define a schema interface for User
// interface User {
//   username: string;
//   password: string;
//   email: string;
//   createdAt: Date;
// }

// // Function to create a User object
// function createUser(username: string, password: string, email: string): User {
//   return {
//     username: username,
//     password: password, // In a real application, make sure to hash the password before storing
//     email: email,
//     createdAt: new Date()
//   };
// }

// // Create a new user object
// const newUser: User = createUser("exampleUser", "hashedPassword", "user@example.com");

// Function to insert a User into MongoDB
// async function insertUser(client: MongoClient, user: User): Promise<void> {
//   const result = await client.db("Canvas").collection("users").insertOne(user);
//   console.log(`New user created with the following id: ${result.insertedId}`);
// }

// Create a MongoClient instance with MongoClientOptions
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// // Main function to run the script
// async function run(): Promise<void> {
//   try {
//     await client.connect();
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     await insertUser(client, newUser);
//   } finally {
//     await client.close();
//   }
// }

// run().catch(console.error);