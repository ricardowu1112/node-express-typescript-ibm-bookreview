"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.isValid = void 0;
const mongodb_1 = require("mongodb");
// Define a URI string for MongoDB connection
const uri = "mongodb://rick:123456@52.184.80.174:27017/?authMechanism=DEFAULT";
function isValid(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.connect();
            const db = exports.client.db("Canvas");
            const collection = db.collection("users");
            const user = yield collection.findOne({ username: username });
            return user;
        }
        catch (error) {
            console.error("An error occurred while checking if username is valid:", error);
            return false;
        }
        finally {
            yield exports.client.close();
        }
    });
}
exports.isValid = isValid;
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
exports.client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
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
