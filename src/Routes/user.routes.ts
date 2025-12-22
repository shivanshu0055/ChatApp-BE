import { Router } from 'express'
import { authMiddleware } from '../Middlewares/auth.middleware'
import { getFriends, getRecentGroups, getUserByID, searchGroups, searchUsers } from '../Controllers/user.controller'

export const userRouter=Router()

userRouter.get("/getFriends",authMiddleware,getFriends)
userRouter.post("/searchGroups",authMiddleware,searchGroups)
userRouter.post("/searchUsers",authMiddleware,searchUsers)
userRouter.post("/getRecentGroups",authMiddleware,getRecentGroups)
userRouter.post("/getUserByID/:userID",authMiddleware,getUserByID)





