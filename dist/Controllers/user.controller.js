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
exports.saveMessageDM = exports.createRoom = exports.getRoomID = exports.getPendingRequests = exports.getFriends = exports.getChatList = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const DB_1 = require("../DB/DB");
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverID } = req.body;
    const senderID = req.userID;
    const requestDB = yield DB_1.FriendRequestModel.find({
        senderID: senderID,
        receiverID: receiverID,
    });
    if (requestDB) {
        return res.status(401).json({
            "message": "friend request already sent"
        });
    }
    const requestDBReverse = yield DB_1.FriendRequestModel.find({
        senderID: receiverID,
        receiverID: senderID
    });
    if (requestDBReverse) {
        return res.status(401).json({
            "message": "The other person has already sent you a friend request"
        });
    }
    const request = yield DB_1.FriendRequestModel.create({
        senderID: senderID,
        receiverID: receiverID,
    });
    yield DB_1.UserModel.updateOne({ _id: receiverID }, { $addToSet: { receivedRequests: request._id } });
    yield DB_1.UserModel.updateOne({ _id: senderID }, { $addToSet: { sentRequests: request._id } });
    return res.status(200).json({
        "message": "friend request sent successfully"
    });
});
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestID } = req.body;
    const request = yield DB_1.FriendRequestModel.findOneAndUpdate({ _id: requestID }, { $set: { status: "Accepted" } }, { new: true });
    if (!request) {
        return;
    }
    const senderID = request.senderID;
    const receiverID = request.receiverID;
    yield DB_1.UserModel.updateOne({ _id: senderID }, { $addToSet: { friends: receiverID } });
    yield DB_1.UserModel.updateOne({ _id: receiverID }, { $addToSet: { friends: senderID } });
    return res.status(201).json({
        "message": "friend request accepted"
    });
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestID } = req.body;
    const request = yield DB_1.FriendRequestModel.findOneAndUpdate({ _id: requestID }, { $set: { status: "Rejected" } }, { new: true });
    if (!request) {
        return;
    }
    const senderID = request.senderID;
    const receiverID = request.receiverID;
    yield DB_1.UserModel.updateOne({ _id: senderID }, { $pull: { sentRequests: requestID } });
    yield DB_1.UserModel.updateOne({ _id: receiverID }, { $pull: { receivedRequests: requestID } });
    return res.status(201).json({
        "message": "friend request rejected"
    });
});
exports.rejectFriendRequest = rejectFriendRequest;
const getChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getChatList = getChatList;
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const friendList = yield DB_1.UserModel.findById(userID);
    if (!friendList) {
        return res.status(401).json({
            "error": "An error occured !"
        });
    }
    return res.status(201).json({
        "friends": friendList.friends
    });
});
exports.getFriends = getFriends;
const getPendingRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const pendingRequests = yield DB_1.FriendRequestModel.find({
        receiverID: userID,
        status: "Pending"
    });
    return res.status(200).json({
        "requests": pendingRequests
    });
});
exports.getPendingRequests = getPendingRequests;
const getRoomID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIDA = req.userID;
    const { userIDB } = req.body;
    // check if a room exists between these 2 
    let room = yield DB_1.RoomModel.findOne({
        isGroupChat: false,
        participants: {
            $all: [userIDA, userIDB],
            $size: 2
        }
    });
    if (!room) {
        room = yield DB_1.RoomModel.create({
            creatorID: userIDA,
            participants: [userIDA, userIDB]
        });
    }
    return res.status(201).json({
        "roomID": room._id
    });
});
exports.getRoomID = getRoomID;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomName } = req.body;
    const userID = req.userID;
    const room = yield DB_1.RoomModel.create({
        roomName: roomName,
        creatorID: userID,
        isGroupChat: true,
        participants: [userID]
    });
    return res.status(201).json({
        "room": room
    });
});
exports.createRoom = createRoom;
const saveMessageDM = (senderID, roomID, text) => __awaiter(void 0, void 0, void 0, function* () {
    const userIDA = senderID;
    // console.log(userIDA);
    const message = yield DB_1.MessageModel.create({
        userID: userIDA,
        text: text,
        roomID: roomID,
    });
    yield DB_1.RoomModel.findByIdAndUpdate(roomID, {
        lastMessage: message._id
    });
});
exports.saveMessageDM = saveMessageDM;
