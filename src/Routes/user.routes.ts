import { Router } from 'express'
import { authMiddleware } from '../Middlewares/auth.middleware'
import { addMessage, createRoom, deleteMessage, deleteMessageByAdmin, deleteRoom, getAllCreatedRooms, getRoomChats } from '../Controllers/user.controller'

export const userRouter=Router()

userRouter.post("/getAllCreatedRooms",authMiddleware,getAllCreatedRooms)
userRouter.post("/getRoomChats",authMiddleware,getRoomChats)
userRouter.post("/addMessage",authMiddleware,addMessage)
userRouter.post("/deleteRoom",authMiddleware,deleteRoom)
userRouter.post("/createRoom",authMiddleware,createRoom)
userRouter.post("/deleteMessage",authMiddleware,deleteMessage)
userRouter.post("/deleteMessageByAdmin",authMiddleware,deleteMessageByAdmin)



