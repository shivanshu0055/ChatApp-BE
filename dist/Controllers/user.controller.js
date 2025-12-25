"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByID = exports.getRecentGroups = exports.searchGroups = exports.searchUsers = exports.getFriends = void 0;
const DB_1 = require("../DB/DB");
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const friendList = yield DB_1.UserModel.findById(userID).populate("friends");
    if (!friendList) {
        return res.status(404).json({
            "error": "User not found"
        });
    }
    return res.status(200).json({
        "friends": friendList.friends
    });
});
exports.getFriends = getFriends;
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.query;
    const userID = req.userID;
    if (!username || typeof username !== 'string') {
        return res.status(400).json({
            error: "Username query parameter is required"
        });
    }
    const users = yield DB_1.UserModel.find({
        username: { $regex: username, $options: 'i' },
        _id: { $ne: userID }
    })
        .populate("receivedRequests", "senderID")
        .limit(5);
    return res.status(200).json({
        users: users
    });
});
exports.searchUsers = searchUsers;
const searchGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupName } = req.query;
    const userID = req.userID;
    if (!groupName || typeof groupName !== 'string') {
        return res.status(400).json({
            error: "groupName query parameter is required"
        });
    }
    const groups = yield DB_1.ChatModel.find({
        groupName: { $regex: groupName, $options: 'i' },
        isGroupChat: true,
    })
        .limit(5);
    return res.status(200).json({
        groups: groups
    });
});
exports.searchGroups = searchGroups;
const getRecentGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recentGroups = yield DB_1.ChatModel.find({ isGroupChat: true }).sort({ createdAt: -1 }).limit(10);
    return res.status(200).json({
        recentGroups: recentGroups
    });
});
exports.getRecentGroups = getRecentGroups;
const getUserByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.params;
        if (!userID || typeof userID !== "string") {
            return res.status(400).json({
                error: "userID parameter is required"
            });
        }
        const user = yield DB_1.UserModel.findById(userID).select("-password");
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        return res.status(200).json({
            user: user
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});
exports.getUserByID = getUserByID;
