import { Request, Response } from "express"
import { UserModel } from "../DB/DB"
import jwt from 'jsonwebtoken'
import { Document, Mongoose } from "mongoose"
import dotenv from "dotenv";
dotenv.config(); 

export const signup=async (req:Request,res:Response)=>{
    // console.log(req.body);
    
    const { username,password }=req.body
    // console.log("Hello");
    
    const dbUser=await UserModel.findOne({
        username:username
    })

    if(dbUser){
        return res.status(400).json({
            "error":"Username already exists"
        })
    }

    const newUser=await UserModel.create({
        username:username,
        password:password
    })

    res.status(201).json({
        "user":newUser
    })

}

export const signin=async (req:Request,res:Response)=>{
    const { username,password }=req.body
    
    const userDB=await UserModel.findOne({
        username:username,
        password:password
    })

    if(!userDB){
        return res.status(400).json({
            "error":"Wrong Credentials"
        })
    }

    if(!process.env.JWT_TOKEN){
        return res.status(400).json({
            "error":"JWT_TOKEN is null"
        })
    }

    const JSONToken=jwt.sign({
        userID:userDB._id,
        username:userDB.username
    },process.env.JWT_TOKEN)

    return res.status(200).json({
        token:JSONToken
    })

}

