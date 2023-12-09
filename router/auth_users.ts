import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import drawings from './booksdb';
import bcrypt from 'bcrypt';
import { isValid } from '../mongo';
import cors from 'cors';
// declare module 'express-session' {
//   interface SessionData {
//     authorization?: { username: string,  accessToken: string}; // Your custom session data properties
//   }
// }

// const isValid = (username: string): boolean => {
//   const userswithsamename = users.filter((user) => {
//     return user.username === username;
//   });
//   return userswithsamename.length > 0;
// };

interface User {
  _id: any;
  username: string;
  hashedPassword: string;
  createdAt: string;
  ip: string;
}

// Create an array of users with the User type
const users: User[] = [
  // {
  //     _id: "0", 
  //     username: 'admin',
  //     hashedPassword: '$2b$10$JiRaWP0.nUCz8oBlK8PTcefLeF85KYRYfErfOa4VcO5.dSQ49BG3u',
  //     createdAt: '0',
  //     ip: '0'
  // }
];

const regd_users: Router = express.Router();
const corsOptions = {origin:'http://127.0.0.1:3009',methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',credentials:true}
regd_users.use(cors(corsOptions)); //
// const users: {id:string; username: string; hashedPassword: string }[] = [{ id: "1", username: 'admin',hashedPassword: 'admin' }];

// const isValid = (username: string): boolean => {
//   const userswithsamename = users.filter((user) => {
//     return user.username === username;
//   });
//   return userswithsamename.length > 0;
// };




// 登录路由中使用会话

regd_users.post('/login', async (req: Request, res: Response) => {
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

  const user = await isValid(username);
  
  if (!user) {
    return res.status(404).json({ message: 'User does not exist!' });
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
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      return res.status(200).json({ message: 'User successfully logged in'});
    } else {
      // Passwords do not match
      console.log('Password is incorrect');
      return res.status(208).json({ message: 'Invalid login. Check username and password' });
    }
  });
});


regd_users.get('/auth/drawings', (req: Request, res: Response) => {
  //  #swagger.description = 'Get all users information: try auth'
    const username = req.user.data;
    //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
    //so use req.session.authorization?username instead
    if (!username) {
      return res.status(400).json({ message: 'Invalid request. Authentication is required.' });
    }
    const seachedDrawing = drawings.find(storedDrawing => storedDrawing.username === username);

    if (seachedDrawing) {
      const existingDrawing = seachedDrawing['drawing'];
      return res.status(200).json(existingDrawing);
    } else {
      // Add a new review
      return res.status(200).json([]);
    }
    // res.send(JSON.stringify(drawings, null, 4));
  });


regd_users.put('/auth/drawing', (req: Request, res: Response) => {
//  #swagger.description = 'Add/edit review to request body and pass in isbn as query parameter'

  const drawing: any = req.body.drawing;
  const username = req.user.data;
  //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
  //so use req.session.authorization?username instead

  if ( !drawing || !username) {
    return res.status(400).json({ message: 'Invalid request. Drawing history and authentication are required.' });
  }


  const seachedDrawing = drawings.find(storedDrawing => storedDrawing.username === username);

  if (seachedDrawing) {
    const existingDrawing = seachedDrawing['drawing'];
    existingDrawing.drawing = drawing;
    return res.status(200).json({ message: 'Drawing modified successfully.' });
  } else {
    // Add a new review
    const newDrawing = {
      username: username,
      drawing: drawing,
    };
    drawings.push(newDrawing);
    return res.status(200).json({ message: 'Drawing added successfully.' });
  }

});



export { regd_users,  users, User };
