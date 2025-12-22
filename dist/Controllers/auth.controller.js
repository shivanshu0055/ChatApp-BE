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
exports.getCurrentUser = exports.signin = exports.signup = void 0;
const DB_1 = require("../DB/DB");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required",
            });
        }
        const dbUser = yield DB_1.UserModel.findOne({
            username: username,
        });
        if (dbUser) {
            return res.status(400).json({
                error: "Username already exists",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield DB_1.UserModel.create({
            username: username,
            password: hashedPassword,
        });
        res.status(201).json({
            newUser
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required",
            });
        }
        const userDB = yield DB_1.UserModel.findOne({
            username: username,
        });
        if (!userDB) {
            return res.status(400).json({
                error: "Wrong Credentials",
            });
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, userDB.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                error: "Wrong Credentials",
            });
        }
        if (!process.env.JWT_TOKEN) {
            return res.status(500).json({
                error: "JWT_TOKEN is not configured",
            });
        }
        const JSONToken = jsonwebtoken_1.default.sign({
            userID: userDB._id,
            username: userDB.username,
        }, process.env.JWT_TOKEN);
        return res.status(200).json({
            username: username,
            token: JSONToken,
            userID: userDB._id
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});
exports.signin = signin;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const user = yield DB_1.UserModel.findById(userID);
    if (!user) {
        return res.status(400).json({
            "message": "user does not exist"
        });
    }
    return res.json(200).json({
        user: user
    });
});
exports.getCurrentUser = getCurrentUser;
