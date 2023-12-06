import express, { Request, Response, Router } from 'express';
// import { isValid, users } from './auth_users';
import books from './booksdb';
import { v4 as uuidv4 } from 'uuid';

const users: { id: string; username: string; password: string }[] = [{ id: '0', username: 'admin', password: 'admin' }];

const isValid = (username: string): boolean => {
    const userswithsamename = users.filter((user) => {
      return user.username === username;
    });
    return userswithsamename.length > 0;
  };

const public_users: Router = express.Router();

public_users.post('/register', (req: Request, res: Response) => {
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
  try {
    res.send(JSON.stringify(books, null, 4));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
});



export { public_users };
