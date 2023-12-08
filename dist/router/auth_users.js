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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = exports.regd_users = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const booksdb_1 = __importDefault(require("./booksdb"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongo_1 = require("../mongo");
// Create an array of users with the User type
const users = [
// {
//     _id: "0", 
//     username: 'admin',
//     hashedPassword: '$2b$10$JiRaWP0.nUCz8oBlK8PTcefLeF85KYRYfErfOa4VcO5.dSQ49BG3u',
//     createdAt: '0',
//     ip: '0'
// }
];
exports.users = users;
const regd_users = express_1.default.Router();
exports.regd_users = regd_users;
// const users: {id:string; username: string; hashedPassword: string }[] = [{ id: "1", username: 'admin',hashedPassword: 'admin' }];
// const isValid = (username: string): boolean => {
//   const userswithsamename = users.filter((user) => {
//     return user.username === username;
//   });
//   return userswithsamename.length > 0;
// };
// 登录路由中使用会话
regd_users.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*  #swagger.parameters['body'] = {
            in: 'body',
            description: 'Login with username and password',
            schema: {
                $username: 'JohnDoe',
                $password: '123456'
            }
    } */
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }
    const user = yield (0, mongo_1.isValid)(username);
    if (!user) {
        return res.status(404).json({ message: 'User does not exist!' });
    }
    bcrypt_1.default.compare(password, user.hashedPassword, (err, result) => {
        if (err) {
            // Handle error
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        else if (result) {
            // Passwords match
            console.log('Password is correct');
            // If you want to generate an access token and store it in the session
            const accessToken = jsonwebtoken_1.default.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
            req.session.authorization = {
                accessToken,
                username,
            };
            res.setHeader('Authorization', `Bearer ${accessToken}`);
            return res.status(200).json({ message: 'User successfully logged in' });
        }
        else {
            // Passwords do not match
            console.log('Password is incorrect');
            return res.status(208).json({ message: 'Invalid login. Check username and password' });
        }
    });
}));
regd_users.get('/auth/drawings', (req, res) => {
    //  #swagger.description = 'Get all users information: try auth'
    const username = req.user.data;
    //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
    //so use req.session.authorization?username instead
    if (!username) {
        return res.status(400).json({ message: 'Invalid request. Authentication is required.' });
    }
    res.send(JSON.stringify(booksdb_1.default, null, 4));
});
regd_users.put('/auth/drawing', (req, res) => {
    //  #swagger.description = 'Add/edit review to request body and pass in isbn as query parameter'
    const drawing = req.body.drawing;
    const username = req.user.data;
    //is use username= req.session.authorization.username; is wrong, as we don't know whether the username is property or not, 
    //so use req.session.authorization?username instead
    if (!drawing || !username) {
        return res.status(400).json({ message: 'Invalid request. Drawing history and authentication are required.' });
    }
    const seachedDrawing = booksdb_1.default.find(storedDrawing => storedDrawing.username === username);
    if (seachedDrawing) {
        const existingDrawing = seachedDrawing['drawing'];
        existingDrawing.drawing = drawing;
        return res.status(200).json({ message: 'Drawing modified successfully.' });
    }
    else {
        // Add a new review
        const newDrawing = {
            username: username,
            drawing: drawing,
        };
        booksdb_1.default.push(newDrawing);
        return res.status(200).json({ message: 'Drawing added successfully.' });
    }
});
