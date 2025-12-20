import { Router } from "express";
import { authMiddleware } from "../Middlewares/auth.middleware";
import { createChat, deleteChat, getChatList, getGroupList, joinGroup, leaveGroup } from "../Controllers/chat.controller";

export const chatRouter=Router()

chatRouter.post("/getChatList",authMiddleware,getChatList)
chatRouter.post("/getGroupList",authMiddleware,getGroupList)
chatRouter.post("/createChat",authMiddleware,createChat)
chatRouter.post("/deleteChat/:chatID",authMiddleware,deleteChat)
chatRouter.post("/joinGroup",authMiddleware,joinGroup)
chatRouter.post("/leaveGroup",authMiddleware,leaveGroup)
