import express, { Request, Response, Router } from 'express';
// import { isValid } from './auth_users';
import { isValid } from '../mongo';
import books from './booksdb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {users, User} from './auth_users';
import morganMiddleware from '../morgan';
import logger from '../logger';
import {client} from '../mongo';
import { MongoClient, ServerApiVersion } from "mongodb";
// import connectToDatabase from '../mongo';
// import User from '../src/schema/User'; // Import your Mongoose model


const saltRounds = 10;


const public_users: Router = express.Router();


public_users.use(morganMiddleware);


export async function insertUser(client: MongoClient, user: User): Promise<void> {
    const result = await client.db("Canvas").collection("users").insertOne(user);
    console.log(`New user created with the following id: ${result.insertedId}`);
  }

// public_users.post('/register',  async(req: Request, res: Response) => {
//  

// try {
//     const newUser = new User(req.body);
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred' });
//   }

    // const { error } = registerUserDto.validate(req.body);
    // if (error) {
    //     return res.status(400).send(error.details[0].message);
    // }

    public_users.post('/register', async (req: Request, res: Response) => {
        // #swagger.summary = 'User registration'
        /*  #swagger.requestBody = {
                required: true,
            }
        */
        const username: string = req.body.username;
        const password: string = req.body.password;
      
        if (!username || !password) {
            return res.status(400).json({ message: 'Missing username or password' });
        }
    
        const user = await isValid(username);
        if (user) {
            return res.status(404).json({ message: 'User already exists!' });
        }
    
        try {
            const hashedPassword: string = await bcrypt.hash(password, saltRounds);
            const ipAddress: any = req.ip;
            const id: string = uuidv4() + '-U-' + Date.now();
            const newUser = { _id: id, username: username, hashedPassword: hashedPassword, createdAt: new Date().toISOString(), ip: ipAddress };
            // users.push(newUser);
            logger.info(`|User register| username: ${username}, id: ${id} at ${ipAddress}  |success|.`);
    
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            await insertUser(client, newUser);
            await client.close();
    
            return res.status(200).json({ message: `User ${username} registered successfully!` });
        } catch (error) {
            logger.error('Unable to register user.');
            return res.status(500).json({ message: 'An error occurred during registration.' });
        }
    });

public_users.get('/', async (req: Request, res: Response) => {
//  #swagger.description = 'Get all books information'
  try {
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});



export { public_users, users };
