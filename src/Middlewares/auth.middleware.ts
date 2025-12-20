import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

    const verifiedPayload = jwt.verify(token, process.env.JWT_TOKEN) as JwtPayload | string;

    if (!verifiedPayload || typeof verifiedPayload === "string") {
      return res.status(401).json({
        message: "Token verification failed",
      });
    }

    req.userID = verifiedPayload.userID as string;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};