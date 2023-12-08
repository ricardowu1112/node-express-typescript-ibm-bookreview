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
exports.users = exports.public_users = exports.insertUser = void 0;
const express_1 = __importDefault(require("express"));
// import { isValid } from './auth_users';
const mongo_1 = require("../mongo");
const booksdb_1 = __importDefault(require("./booksdb"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_users_1 = require("./auth_users");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return auth_users_1.users; } });
const morgan_1 = __importDefault(require("../morgan"));
const logger_1 = __importDefault(require("../logger"));
const mongo_2 = require("../mongo");
// import connectToDatabase from '../mongo';
// import User from '../src/schema/User'; // Import your Mongoose model
const saltRounds = 10;
const public_users = express_1.default.Router();
exports.public_users = public_users;
public_users.use(morgan_1.default);
function insertUser(client, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield client.db("Canvas").collection("users").insertOne(user);
        console.log(`New user created with the following id: ${result.insertedId}`);
    });
}
exports.insertUser = insertUser;
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
public_users.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // #swagger.summary = 'User registration'
    /*  #swagger.requestBody = {
            required: true,
        }
    */
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(400).json({ message: 'Missing username or password' });
    }
    const user = yield (0, mongo_1.isValid)(username);
    if (user) {
        return res.status(404).json({ message: 'User already exists!' });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const ipAddress = req.ip;
        const id = (0, uuid_1.v4)() + '-U-' + Date.now();
        const newUser = { _id: id, username: username, hashedPassword: hashedPassword, createdAt: new Date().toISOString(), ip: ipAddress };
        // users.push(newUser);
        logger_1.default.info(`|User register| username: ${username}, id: ${id} at ${ipAddress}  |success|.`);
        yield mongo_2.client.connect();
        yield mongo_2.client.db("admin").command({ ping: 1 });
        yield insertUser(mongo_2.client, newUser);
        yield mongo_2.client.close();
        return res.status(200).json({ message: `User ${username} registered successfully!` });
    }
    catch (error) {
        logger_1.default.error('Unable to register user.');
        return res.status(500).json({ message: 'An error occurred during registration.' });
    }
}));
public_users.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //  #swagger.description = 'Get all books information'
    try {
        res.send(JSON.stringify(booksdb_1.default, null, 4));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    }
}));
