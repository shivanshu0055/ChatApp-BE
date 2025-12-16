import { Router } from 'express'
import { authMiddleware } from '../Middlewares/auth.middleware'
import { acceptFriendRequest, createRoom, getFriends, getPendingRequests, getRoomID, rejectFriendRequest, sendFriendRequest } from '../Controllers/user.controller'

export const userRouter=Router()

userRouter.post("/sendFriendRequest",authMiddleware,sendFriendRequest)
userRouter.post("/acceptFriendRequest",authMiddleware,acceptFriendRequest)
userRouter.post("/rejectFriendRequest",authMiddleware,rejectFriendRequest)
userRouter.post("/getRoomID",authMiddleware,getRoomID)
userRouter.post("/getFriends",authMiddleware,getFriends)
userRouter.post("/getPendingRequests",authMiddleware,getPendingRequests)
userRouter.post("/createRoom",authMiddleware,createRoom)







