"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_session_1 = __importDefault(require("express-session"));
const auth_users_1 = require("./router/auth_users");
const general_1 = require("./router/general");
// import dotenv from 'dotenv';
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("./swagger-output.json"));
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use('/doc', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
app.use(express_1.default.json());
app.use("/customer", (0, express_session_1.default)({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));
app.use('/customer/auth/*', function auth(req, res, next) {
    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.slice(7); // Remove 'Bearer ' prefix
        jsonwebtoken_1.default.verify(token, 'access', (err, user) => {
            if (!err) {
                req.user = user;
                next();
            }
            else {
                return res.status(403).json({ message: 'User not authenticated' });
            }
        });
    }
    else {
        return res.status(403).json({ message: 'User not logged in' });
    }
});
app.use("/customer", auth_users_1.regd_users);
app.use("/", general_1.public_users);
app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});
