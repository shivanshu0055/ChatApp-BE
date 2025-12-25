
import { Request,Response } from "express"
import { ChatModel, MessageModel } from "../DB/DB"

export const getChat=async (req:Request,res:Response)=>{
    const { chatID } = req.params
    const userID = req.userID

    const chat = await ChatModel.findById(chatID).populate("participants", "username")

    if (!chat) {
        return res.status(404).json({ error: "Chat not found" })
    }

    if (!chat.participants.some(p => p._id.toString() === userID)) {
        return res.status(403).json({ error: "Not a participant" })
    }

    return res.status(200).json(chat)
}

export const getChatList=async (req:Request,res:Response)=>{
    const userID=req.userID

    const chatList = await ChatModel.find({
        participants: userID,
        isGroupChat:false
      })
      .populate("participants", "username")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      
    return res.status(200).json({
        "chatList":chatList
    })
}

export const getGroupList=async (req:Request,res:Response)=>{
    const userID=req.userID

    const groupList = await ChatModel.find({
        participants: userID,
        isGroupChat:true
      })
      .populate("participants", "username")
      .populate("admin", "username")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      
    return res.status(200).json({
        "groupList":groupList
    })
}  

export const createChat=async (req:Request,res:Response)=>{
    const userID=req.userID
    const { isGroupChat }=req.body 
    if(isGroupChat){
        const chat=await ChatModel.create({
            participants:[userID],
            isGroupChat:true,
            groupName:req.body.groupName,
            admin:userID
        })
        res.status(200).json({
            "newChat":chat
        })
    }
    else{
        const { userIDB } = req.body

        const existingChat = await ChatModel.findOne({
            isGroupChat: false,
            participants: { $all: [userID, userIDB] }
          })
          
        if (existingChat) {
            return res.status(200).json({ chat: existingChat })
        }          

        const chat=await ChatModel.create({
            participants:[userID,userIDB],
            isGroupChat:false,
        })

        res.status(200).json({
            "newChat":chat
        })
    }
}

export const deleteChat=async (req:Request,res:Response)=>{
    const { chatID }=req.params
    const userID=req.userID

    const chat = await ChatModel.findById(chatID)

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" })
    }

    if(chat.isGroupChat){
    
    if (chat.admin?.toString()!=userID) {
        return res.status(403).json({ message: "Not authorized" })
    }

    await MessageModel.deleteMany({
        chatID: chatID
    })

    await ChatModel.findByIdAndDelete(chatID)

    return res.status(200).json({
        message:"Chat deleted"
    })
    }
    else{
        if (
            !userID ||
            !chat.participants.some((participant) => participant.toString() === userID)
        ) {
            return res.status(403).json({ message: "Not authorized" })
        }
        await MessageModel.deleteMany({
            chatID: chatID
        })
        await ChatModel.findByIdAndDelete(chatID)
        return res.status(200).json({
            message:"Chat deleted"
        })
    }
}

export const joinGroup = async (req: Request, res: Response) => {
    const userID = req.userID;
    const { chatID } = req.body;

    if (!chatID) {
        return res.status(400).json({ message: "chatID is required" });
    }

    const chat = await ChatModel.findById(chatID);
    if (!chat) {
        return res.status(404).json({ message: "Group not found" });
    }

    if (!chat.isGroupChat) {
        return res.status(400).json({ message: "This is not a group chat" });
    }

    // Check if user is already a participant
    const alreadyMember = chat.participants.some((p: any) => p.toString() === userID);
    if (alreadyMember) {
        return res.status(400).json({ message: "You are already a member of this group" });
    }

    // Add user to participants
    await ChatModel.findByIdAndUpdate(chatID, {
        $addToSet: { participants: userID }
    });

    const updatedChat = await ChatModel.findById(chatID)
        .populate("participants", "username")
        .populate("admin", "username");

    return res.status(200).json({
        message: "Successfully joined the group",
        group: updatedChat
    });
};

export const leaveGroup = async (req: Request, res: Response) => {
    const userID = req.userID;
    const { chatID } = req.body;

    if (!chatID) {
        return res.status(400).json({ message: "chatID is required" });
    }

    const chat = await ChatModel.findById(chatID);
    if (!chat) {
        return res.status(404).json({ message: "Group not found" });
    }

    if (!chat.isGroupChat) {
        return res.status(400).json({ message: "This is not a group chat" });
    }

    // If the user is not a participant of the group
    const isParticipant = chat.participants.some((p: any) => p.toString() === userID);
    if (!isParticipant) {
        return res.status(400).json({ message: "You are not a member of this group" });
    }

    // If the user is the admin, prevent them from leaving (alternatively, admin can assign someone else)
    if (chat.admin && chat.admin.toString() === userID) {
        return res.status(403).json({
            message: "Group admin cannot leave the group. Please assign another admin and try again."
        });
    }

    // Remove user from the participants array
    await ChatModel.findByIdAndUpdate(chatID, {
        $pull: { participants: userID }
    });

    const updatedChat = await ChatModel.findById(chatID)
        .populate("participants", "username")
        .populate("admin", "username");

    return res.status(200).json({
        message: "Successfully left the group",
        group: updatedChat
    });
};

