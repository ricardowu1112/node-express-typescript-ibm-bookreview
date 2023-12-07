import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import books from './booksdb';
import bcrypt from 'bcrypt';

// declare module 'express-session' {
//   interface SessionData {
//     authorization?: { username: string,  accessToken: string}; // Your custom session data properties
//   }
// }


const users: { id: string; username: string; hashedPassword: string }[] = [{id: "0", username: 'admin',hashedPassword: '$2b$10$sqnNDaeLbVwvAmcNH2xrVeLSsiO7xJWtSigPoed/2aJYB63nZ5mG.'}];

const regd_users: Router = express.Router();

// const users: {id:string; username: string; hashedPassword: string }[] = [{ id: "1", username: 'admin',hashedPassword: 'admin' }];

const isValid = (username: string): boolean => {
  const userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};


// 登录路由中使用会话

regd_users.post('/login', (req: Request, res: Response) => {
/*  #swagger.parameters['body'] = {
        in: 'body',
        description: 'Login with username and password',
        schema: {
            $username: 'JohnDoe',
            $password: '123456'
        }
} */
  const username: string = req.body.username;
  const password: string = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing username or password' });
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).json({ message: 'username does not exist' });
  }


  bcrypt.compare(password, user.hashedPassword, (err, result) => {
    if (err) {
      // Handle error
      return res.status(500).json({ message: 'Internal Server Error' });
    } else if (result) {
      // Passwords match
      console.log('Password is correct');

      // If you want to generate an access token and store it in the session
      const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,
        username,
      };

      res.setHeader('Authorization', `Bearer ${accessToken}`);
      return res.status(200).json({ message: 'User successfully logged in' });
    } else {
      // Passwords do not match
      console.log('Password is incorrect');
      return res.status(208).json({ message: 'Invalid login. Check username and password' });
    }
  });
});


regd_users.get('/auth/users', (req: Request, res: Response) => {
  //  #swagger.description = 'Get all users information: try auth'
    const username = req.user.data;
    //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
    //so use req.session.authorization?username instead
    if (!username) {
      return res.status(400).json({ message: 'Invalid request. Authentication is required.' });
    }
    res.send(JSON.stringify(users, null, 4));
  });
  

regd_users.put('/auth/review/:isbn', (req: Request, res: Response) => {
//  #swagger.description = 'Add/edit review to request body and pass in isbn as query parameter'

  const isbn: number = +req.params.isbn; // 使用+将参数转换为数字
  const review: string = req.body.review;
  const username = req.user.data;
  //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
  //so use req.session.authorization?username instead

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: 'Invalid request. ISBN, review, and authentication are required.' });
  }


  const filteredReviews = books[isbn]?.reviews.filter((r) => {
    return r.username === username;
  });

  if (filteredReviews?.length > 0) {
    const existingReview = filteredReviews[0];
    existingReview.review = review;
    return res.status(200).json({ message: 'Review modified successfully.' });
  } else {
    // Add a new review
    const newReview = {
      username: username,
      review: review,
    };
    books[isbn]?.reviews.push(newReview);
    return res.status(200).json({ message: 'Review added successfully.' });
  }

});

export { regd_users, isValid, users };
