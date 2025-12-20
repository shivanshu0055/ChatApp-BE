import { Request, Response } from "express";
import { UserModel } from "../DB/DB";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const dbUser = await UserModel.findOne({
      username: username,
    });

    if (dbUser) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    res.status(201).json({
      newUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const userDB = await UserModel.findOne({
      username: username,
    });

    if (!userDB) {
      return res.status(400).json({
        error: "Wrong Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userDB.password);

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

    const JSONToken = jwt.sign(
      {
        userID: userDB._id,
        username: userDB.username,
      },
      process.env.JWT_TOKEN
    );

    return res.status(200).json({
      username:username,
      token: JSONToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCurrentUser=async (req:Request,res:Response)=>{
  const userID=req.userID
  
  const user=await UserModel.findById(userID)

  if(!user){
    return res.status(400).json({
      "message":"user does not exist"
    })
  }

  return res.json(200).json({
    user:user
  })
}