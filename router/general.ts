import express, { Request, Response, Router } from 'express';
import { isValid } from './auth_users';
import books from './booksdb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import {users} from './auth_users';
import morganMiddleware from '../morgan';
import logger from '../logger';
// import connectToDatabase from '../mongo';
// import User from '../src/schema/User'; // Import your Mongoose model


const saltRounds = 10;


const public_users: Router = express.Router();


public_users.use(morganMiddleware);

public_users.post('/register',  async(req: Request, res: Response) => {
// #swagger.description = 'Any one can register account through this endpoint'

// try {
//     const newUser = new User(req.body);
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred' });
//   }

  const username: string = req.body.username;
  const password: string = req.body.password;
  
  const id: string = uuidv4() + '-U-' + Date.now();
  
  if (username && password) {
    if (!isValid(username)) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          // Handle error
        } else {
          // Store the hash in your database or use it as needed
          const hashedPassword: string = hash;
          const ipAddress: any = req.ip;
          users.push({ id, username, hashedPassword, createdAt: new Date().toISOString(), ip: ipAddress });

          const logMessage = `|User register| username: ${username}, id: ${id} at ${ipAddress}  |success|.`;
          logger.info(logMessage);

          const responseMessage = `User ${username} registered successfully!`;
          return res.status(200).json({ responseMessage });
        }
      });
      
    } else {
      return res.status(404).json({ message: 'User already exists!' });
    }
  }

  const message = 'Unable to register user.';
  logger.error(message);
  return res.status(404).json({ message});
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
