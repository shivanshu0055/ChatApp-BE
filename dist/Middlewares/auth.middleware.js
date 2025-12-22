"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const header = req.headers["authorization"];
        if (!header || typeof header !== "string") {
            return res.status(401).json({
                message: "Authorization header missing",
            });
        }
        const [scheme, token] = header.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Invalid authorization header format",
            });
        }
        if (!process.env.JWT_TOKEN) {
            return res.status(500).json({
                message: "JWT secret not configured on server",
            });
        }
        // console.log(token);
        const verifiedPayload = jsonwebtoken_1.default.verify(token, process.env.JWT_TOKEN);
        if (!verifiedPayload || typeof verifiedPayload === "string") {
            return res.status(401).json({
                message: "Token verification failed",
            });
        }
        req.userID = verifiedPayload.userID;
        return next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};
exports.authMiddleware = authMiddleware;
