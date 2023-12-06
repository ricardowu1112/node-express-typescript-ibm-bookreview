import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import books from './booksdb';
// declare module 'express-session' {
//   interface SessionData {
//     authorization?: { username: string,  accessToken: string}; // Your custom session data properties
//   }
// }

const regd_users: Router = express.Router();



const users: { username: string; password: string }[] = [{ username: 'admin', password: 'admin' }];

const isValid = (username: string): boolean => {
  const userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username: string, password: string): boolean => {
  const validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
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
    return res.status(400).json({ message: 'Error logging in' });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });


    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({ message: 'User successfully logged in', accessToken });
  } else {
    return res.status(208).json({ message: 'Invalid Login. Check username and password' });
  }
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
