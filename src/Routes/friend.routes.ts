import { Router } from "express";
import { authMiddleware } from "../Middlewares/auth.middleware";
import { acceptFriendRequest, cancelFriendRequest, getPendingRequests, rejectFriendRequest, sendFriendRequest } from "../Controllers/friend.controller";

export const friendRouter=Router()

friendRouter.post("/sendFriendRequest",authMiddleware,sendFriendRequest)
friendRouter.post("/acceptFriendRequest",authMiddleware,acceptFriendRequest)
friendRouter.post("/rejectFriendRequest",authMiddleware,rejectFriendRequest)
friendRouter.post("/cancelFriendRequest",authMiddleware,cancelFriendRequest)
friendRouter.post("/getPendingRequests",authMiddleware,getPendingRequests)