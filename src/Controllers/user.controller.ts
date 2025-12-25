import { Request, Response } from "express";
import { FriendRequestModel, MessageModel, ChatModel, UserModel } from "../DB/DB";


export const getFriends=async (req:Request,res:Response)=>{
    const userID=req.userID

    const friendList=await UserModel.findById(userID).populate("friends")

    if(!friendList){
        return res.status(404).json({
            "error":"User not found"
        })
    }

    return res.status(200).json({
        "friends":friendList.friends
    })
}

export const searchUsers=async (req:Request,res:Response)=>{
    const { username }=req.query
    const userID=req.userID

    if(!username || typeof username !== 'string'){
        return res.status(400).json({
            error:"Username query parameter is required"
        })
    }

    const users = await UserModel.find({
        username: { $regex: username, $options: 'i' },
        _id: { $ne: userID }
    })
    .populate("receivedRequests","senderID")
    .limit(5) 

    return res.status(200).json({
        users: users
    })
}

export const searchGroups=async (req:Request,res:Response)=>{
    const { groupName }=req.query
    const userID=req.userID

    if(!groupName || typeof groupName !== 'string'){
        return res.status(400).json({
            error:"groupName query parameter is required"
        })
    }

    const groups = await ChatModel.find({
        groupName: { $regex: groupName, $options: 'i' },
        isGroupChat: true,
    })
    .limit(5) 

    return res.status(200).json({
        groups: groups
    })
}

export const getRecentGroups=async (req:Request,res:Response)=>{

    const recentGroups = await ChatModel.find({isGroupChat:true}).sort({ createdAt: -1 }).limit(10);

    return res.status(200).json({
        recentGroups: recentGroups
    });

} 

export const getUserByID=async (req:Request,res:Response)=>{
    try {
        const { userID } = req.params;

        if (!userID || typeof userID !== "string") {
            return res.status(400).json({
                error: "userID parameter is required"
            });
        }

        const user = await UserModel.findById(userID).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.status(200).json({
            user: user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}