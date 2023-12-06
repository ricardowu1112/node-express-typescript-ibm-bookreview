import express, { Request, Response, Router } from 'express';
import { isValid } from './auth_users';
import books from './booksdb';
import { v4 as uuidv4 } from 'uuid';
// import connectToDatabase from '../mongo';
// import User from '../src/schema/User'; // Import your Mongoose model

const users: { id: string; username: string; password: string }[] = [{ id: '0', username: 'admin', password: 'admin' }];


const public_users: Router = express.Router();


public_users.post('/register', async(req: Request, res: Response) => {
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
      users.push({ id, username, password });
      const message = `User ${username} successfully registered. Now you can login`;
      return res.status(200).json({ message });
    } else {
      return res.status(404).json({ message: 'User already exists!' });
    }
  }
  return res.status(404).json({ message: 'Unable to register user.' });
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



export { public_users };
