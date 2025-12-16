"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = exports.MessageModel = exports.RoomModel = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Users' }],
    receivedRequests: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'FriendRequests' }],
    sentRequests: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'FriendRequests' }],
});
const friendRequestSchema = new mongoose_1.Schema({
    senderID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
    receiverID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
    status: { type: String, required: true, default: 'Pending' },
}, {
    timestamps: true,
});
const roomSchema = new mongoose_1.Schema({
    roomName: { type: String },
    creatorID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Users' }],
    isGroupChat: { type: Boolean, required: true, default: false },
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Messages' }
}, {
    timestamps: true
});
const messageSchema = new mongoose_1.Schema({
    userID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
    roomID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rooms', required: true },
    text: { type: String, required: true },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Users' }],
    groupChat: { type: Boolean, default: false }
}, {
    timestamps: true,
});
exports.UserModel = (0, mongoose_2.model)("Users", userSchema);
exports.RoomModel = (0, mongoose_2.model)("Rooms", roomSchema);
exports.MessageModel = (0, mongoose_2.model)("Messages", messageSchema);
exports.FriendRequestModel = (0, mongoose_2.model)("FriendRequests", friendRequestSchema);
