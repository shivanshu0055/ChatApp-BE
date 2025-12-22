"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = exports.MessageModel = exports.ChatModel = exports.UserModel = void 0;
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
const chatSchema = new mongoose_1.Schema({
    participants: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Users", required: true }
    ],
    isGroupChat: { type: Boolean, default: false },
    groupName: { type: String },
    lastMessage: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Messages"
    },
    admin: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: function () {
            return this.isGroupChat;
        }
    }
}, { timestamps: true });
const messageSchema = new mongoose_1.Schema({
    chatID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Chats",
        required: true
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    content: { type: String, required: true },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Users" }]
}, { timestamps: true });
exports.UserModel = (0, mongoose_2.model)("Users", userSchema);
exports.ChatModel = (0, mongoose_2.model)("Chats", chatSchema);
exports.MessageModel = (0, mongoose_2.model)("Messages", messageSchema);
exports.FriendRequestModel = (0, mongoose_2.model)("FriendRequests", friendRequestSchema);
