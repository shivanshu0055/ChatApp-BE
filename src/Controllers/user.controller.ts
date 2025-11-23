import { Request, Response } from "express";
import { MessageModel, RoomModel } from "../DB/DB";

export const getAllCreatedRooms=async (req:Request,res:Response)=>{
    const userID=req.userID
    const createdRooms=await RoomModel.find({
        creatorID:userID
    })
    return res.status(201).json({
        "createdRooms":createdRooms
    })
}

export const getRoomChats=async (req:Request,res:Response)=>{
    const userID=req.userID
    const roomID=req.body.roomID

    const messages=await MessageModel.find({
        roomID:roomID
    }).populate("userID", "username")
    .sort({createdAt:1})

    res.status(201).json({
        "messages":messages
    })
}


export const addMessage=async (req:Request,res:Response)=>{
    const userID=req.userID
    const roomID=req.body.roomID
    const text=req.body.text

    const message=await MessageModel.create({
        roomID:roomID,
        userID:userID,
        type:"message",
        text:text
    })

    res.status(201).json({
        "message":message
    })
}

export const createRoom=async (req:Request,res:Response)=>{
    const userID=req.userID
    const roomID=req.body.roomID

    const newRoom=await RoomModel.create({
        roomID:roomID,
        creatorID:userID
    })

    res.status(201).json({
        "newRoom":newRoom
    })
}



export const deleteRoom=async (req:Request,res:Response)=>{
    const userID=req.userID
    const roomID=req.body.roomID

    await RoomModel.deleteOne({
        roomID:roomID
    })

    res.status(201).json({
        "info":"Room deleted successfully"
    })
}

export const deleteMessage=async (req:Request,res:Response)=>{
    const userID=req.userID
    const messageID=req.body.messageID

    await MessageModel.updateOne(
        { _id: messageID, userID: userID },
        {
          $set: {
            text: "Message has been deleted by user",
            type: "deleted-message",
          },
        }
      );

    res.status(201).json({
        "info":"Room deleted/updated successfully"
    })
}

export const deleteMessageByAdmin=async (req:Request,res:Response)=>{
    const messageID=req.body.messageID
    const userID=req.userID
    const roomID=req.body.roomID

    const room=await RoomModel.findOne({
        roomID:roomID,
        creatorID:userID
    })    

    if(!room){
        res.status(400).json({
            "message":"Your are not the admin"
        })
    }

    await MessageModel.updateOne(
        { _id: messageID},
        {
          $set: {
            text: "Message has been deleted by admin",
            type: "deleted-message",
          },
        }
      );

    res.status(201).json({
        "info":"Message deleted/updated successfully"
    })
}


