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
exports.signin = exports.signup = void 0;
const DB_1 = require("../DB/DB");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { username, password } = req.body;
    console.log("Hello");
    const dbUser = yield DB_1.UserModel.findOne({
        username: username
    });
    if (dbUser) {
        return res.status(400).json({
            "error": "Username already exists"
        });
    }
    const newUser = yield DB_1.UserModel.create({
        username: username,
        password: password
    });
    res.status(201).json({
        "user": newUser
    });
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const userDB = yield DB_1.UserModel.findOne({
        username: username,
        password: password
    });
    if (!userDB) {
        res.status(400).json({
            "error": "Wrong Credentials"
        });
        return;
    }
    if (!process.env.JWT_TOKEN) {
        return res.status(400).json({
            "error": "JWT_TOKEN is null"
        });
    }
    const JSONToken = jsonwebtoken_1.default.sign({
        userID: userDB._id,
        username: userDB.username
    }, process.env.JWT_TOKEN);
    res.status(200).json({
        token: JSONToken,
    });
});
exports.signin = signin;
