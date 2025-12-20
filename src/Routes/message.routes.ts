import { Router } from "express";
import { authMiddleware } from "../Middlewares/auth.middleware";
import { deleteMessage, getMessagesByChatID, sendMessage } from "../Controllers/message.controller";

export const messageRouter=Router()

messageRouter.post("/sendMessage",authMiddleware,sendMessage)
messageRouter.post("/getMessagesByChatID",authMiddleware,getMessagesByChatID)
messageRouter.post("/deleteMessage/:messageID",authMiddleware,deleteMessage)


