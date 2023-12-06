import express, { Request, Response, Application } from 'express';
import jwt from 'jsonwebtoken';
import session, { Session } from 'express-session';
import { regd_users as customer_routes } from './router/auth_users';
import { public_users as genl_routes } from './router/general';
import dotenv from 'dotenv';

dotenv.config();

declare module 'express-session' {
    interface SessionData {
      authorization: { username: string,  accessToken: string}; // Your custom session data properties
    }
}

declare module 'express-serve-static-core' {
    interface Request {
      user?: any;
    }
  }


const app: Application = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  console.log(req.session);
    if (req.session.authorization) {
      const token = req.session.authorization.accessToken;
      jwt.verify(token, "access", (err,user) => {
        if (!err) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      return res.status(403).json({ message: "User not logged in" });
    }
  });

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Express & TypeScript Server');
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
