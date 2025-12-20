import { Request,Response } from "express"
import { FriendRequestModel, UserModel } from "../DB/DB"

export const sendFriendRequest = async (req:Request, res:Response) => {
    const {receiverID} = req.body
    const senderID = req.userID
    
    const requestDB = await FriendRequestModel.findOne({
        senderID,
        receiverID
      })
      
    
    if(requestDB){
        return res.status(401).json({
            "message":"friend request already sent"
        })
    }

    const requestDBReverse=await FriendRequestModel.findOne({
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
    
    const request = await FriendRequestModel.findOneAndUpdate(
        {
          _id: requestID,
          receiverID: req.userID
        },
        { $set: { status: "Accepted" } },
        { new: true }
      )
      
  
    if(!request){
        return res.status(404).json({
            message:"Friend request not found"
        })
    }

    const senderID=request.senderID
    const receiverID=request.receiverID
    
    await UserModel.updateOne(
        { _id: senderID },
        {
          $addToSet: { friends: receiverID },
          $pull: { sentRequests: requestID }
        }
      )
      
    await UserModel.updateOne(
    { _id: receiverID },
    {
        $addToSet: { friends: senderID },
        $pull: { receivedRequests: requestID }
    }
    )

    return res.status(200).json({
        "message":"friend request accepted"
    })
}

export const rejectFriendRequest=async (req:Request,res:Response)=>{
    const {requestID}=req.body
    
    const request=await FriendRequestModel.findOneAndUpdate(
        {_id:requestID,receiverID:req.userID},
        {$set:{status:"Rejected"}},
        {new:true}
    )

    if(!request){
        return res.status(404).json({
            message:"Friend request not found"
        })
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

    return res.status(200).json({
        "message":"friend request rejected"
    })
}

export const cancelFriendRequest = async (req: Request, res: Response) => {
    const { requestID } = req.body;

    // Find and remove the pending friend request sent by the user
    const request = await FriendRequestModel.findOneAndDelete({
        _id: requestID,
        senderID: req.userID,
        status: "Pending"
    });

    if (!request) {
        return res.status(404).json({
            message: "Friend request not found or already processed"
        });
    }

    const senderID = request.senderID;
    const receiverID = request.receiverID;

    // Remove the request from sender's sentRequests
    await UserModel.updateOne(
        { _id: senderID },
        { $pull: { sentRequests: requestID } }
    );

    // Remove the request from receiver's receivedRequests
    await UserModel.updateOne(
        { _id: receiverID },
        { $pull: { receivedRequests: requestID } }
    );

    return res.status(200).json({
        message: "Friend request cancelled"
    });
};

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
