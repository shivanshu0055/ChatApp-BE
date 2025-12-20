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
exports.getPendingRequests = exports.cancelFriendRequest = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const DB_1 = require("../DB/DB");
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverID } = req.body;
    const senderID = req.userID;
    const requestDB = yield DB_1.FriendRequestModel.findOne({
        senderID,
        receiverID
    });
    if (requestDB) {
        return res.status(401).json({
            "message": "friend request already sent"
        });
    }
    const requestDBReverse = yield DB_1.FriendRequestModel.findOne({
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
    const request = yield DB_1.FriendRequestModel.findOneAndUpdate({
        _id: requestID,
        receiverID: req.userID
    }, { $set: { status: "Accepted" } }, { new: true });
    if (!request) {
        return res.status(404).json({
            message: "Friend request not found"
        });
    }
    const senderID = request.senderID;
    const receiverID = request.receiverID;
    yield DB_1.UserModel.updateOne({ _id: senderID }, {
        $addToSet: { friends: receiverID },
        $pull: { sentRequests: requestID }
    });
    yield DB_1.UserModel.updateOne({ _id: receiverID }, {
        $addToSet: { friends: senderID },
        $pull: { receivedRequests: requestID }
    });
    return res.status(200).json({
        "message": "friend request accepted"
    });
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestID } = req.body;
    const request = yield DB_1.FriendRequestModel.findOneAndUpdate({ _id: requestID, receiverID: req.userID }, { $set: { status: "Rejected" } }, { new: true });
    if (!request) {
        return res.status(404).json({
            message: "Friend request not found"
        });
    }
    const senderID = request.senderID;
    const receiverID = request.receiverID;
    yield DB_1.UserModel.updateOne({ _id: senderID }, { $pull: { sentRequests: requestID } });
    yield DB_1.UserModel.updateOne({ _id: receiverID }, { $pull: { receivedRequests: requestID } });
    return res.status(200).json({
        "message": "friend request rejected"
    });
});
exports.rejectFriendRequest = rejectFriendRequest;
const cancelFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestID } = req.body;
    // Find and remove the pending friend request sent by the user
    const request = yield DB_1.FriendRequestModel.findOneAndDelete({
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
    yield DB_1.UserModel.updateOne({ _id: senderID }, { $pull: { sentRequests: requestID } });
    // Remove the request from receiver's receivedRequests
    yield DB_1.UserModel.updateOne({ _id: receiverID }, { $pull: { receivedRequests: requestID } });
    return res.status(200).json({
        message: "Friend request cancelled"
    });
});
exports.cancelFriendRequest = cancelFriendRequest;
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
