import { Request, Response } from "express";
import { FriendRequestModel, MessageModel, RoomModel, UserModel } from "../DB/DB";
import { Schema, Types } from "mongoose";
import { RequestOptions } from "node:http";

export const sendFriendRequest=async (req:Request,res:Response)=>{
    const {receiverID} = req.body
    const senderID = req.userID

    const requestDB=await FriendRequestModel.find({
        senderID:senderID,
        receiverID:receiverID,
    })
    
    if(requestDB){
        return res.status(401).json({
            "message":"friend request already sent"
        })
    }

    const requestDBReverse=await FriendRequestModel.find({
        senderID:receiverID,
        receiverID:senderID
    })

    if(requestDBReverse){
        return res.status(401).json({
            "message":"The other person has already sent you a friend request"
        })
    }

    const request=await FriendRequestModel.create({
        senderID:senderID,
        receiverID:receiverID,
    })

    await UserModel.updateOne(
        {_id:receiverID},
        {$addToSet:{receivedRequests:request._id}}
    )

    await UserModel.updateOne(
        {_id:senderID},
        {$addToSet:{sentRequests:request._id}}
    )

    return res.status(200).json({
        "message":"friend request sent successfully"
    })
}

export const acceptFriendRequest=async (req:Request,res:Response)=>{
    const {requestID}=req.body
    
    const request=await FriendRequestModel.findOneAndUpdate(
        {_id:requestID},
        {$set:{status:"Accepted"}},
        {new:true}
    )

    if(!request){
        return 
    }

    const senderID=request.senderID
    const receiverID=request.receiverID
    
    await UserModel.updateOne(
        {_id:senderID},
        {$addToSet:{friends:receiverID}}
    )

    await UserModel.updateOne(
        {_id:receiverID},
        {$addToSet:{friends:senderID}}
    )

    return res.status(201).json({
        "message":"friend request accepted"
    })
}

export const rejectFriendRequest=async (req:Request,res:Response)=>{
    const {requestID}=req.body
    
    const request=await FriendRequestModel.findOneAndUpdate(
        {_id:requestID},
        {$set:{status:"Rejected"}},
        {new:true}
    )

    if(!request){
        return 
    }

    const senderID=request.senderID
    const receiverID=request.receiverID
    
    await UserModel.updateOne(
        {_id:senderID},
        {$pull:{sentRequests:requestID}}
    )

    await UserModel.updateOne(
        {_id:receiverID},
        {$pull:{receivedRequests:requestID}}
    )

    return res.status(201).json({
        "message":"friend request rejected"
    })
}

export const getChatList=async (req:Request,res:Response)=>{

}

export const getFriends=async (req:Request,res:Response)=>{
    const userID=req.userID

    const friendList=await UserModel.findById(userID)

    if(!friendList){
        return res.status(401).json({
            "error":"An error occured !"
        })
    }

    return res.status(201).json({
        "friends":friendList.friends
    })
}

export const getPendingRequests=async (req:Request,res:Response)=>{
    const userID=req.userID

    const pendingRequests=await FriendRequestModel.find({
        receiverID:userID,
        status:"Pending"
    })

    return res.status(200).json({
        "requests":pendingRequests
    })
}

export const getRoomID=async (req:Request,res:Response)=>{
    const userIDA=req.userID
    const {userIDB}=req.body
    
    // check if a room exists between these 2 
    let room=await RoomModel.findOne({
        isGroupChat:false,
        participants:{
            $all:[userIDA,userIDB],
            $size:2
        }
    })

    if(!room){
        room=await RoomModel.create({
            creatorID:userIDA,
            participants:[userIDA,userIDB]
        })
    }

    return res.status(201).json({
        "roomID":room._id
    })
}

export const createRoom=async (req:Request,res:Response)=>{
    const { roomName }=req.body
    const userID=req.userID

    const room=await RoomModel.create({
        roomName:roomName,
        creatorID:userID,
        isGroupChat:true,
        participants:[userID]
    })

    return res.status(201).json({
        "room":room
    })
}


export const saveMessageDM=async (senderID:Schema.Types.ObjectId,roomID:Schema.Types.ObjectId,text:String)=>{
    const userIDA=senderID
    // console.log(userIDA);
    
    const message=await MessageModel.create({
        userID:userIDA,
        text:text,
        roomID:roomID,
    })

    await RoomModel.findByIdAndUpdate(roomID, {
        lastMessage: message._id
    });

}



