"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.RoomModel = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});
const roomSchema = new mongoose_1.Schema({
    roomID: { type: String, required: true },
    creatorID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true }
});
const messageSchema = new mongoose_1.Schema({
    userID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Users', required: true },
    roomID: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rooms', required: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
}, {
    timestamps: true,
});
exports.UserModel = (0, mongoose_2.model)("Users", userSchema);
exports.RoomModel = (0, mongoose_2.model)("Rooms", roomSchema);
exports.MessageModel = (0, mongoose_2.model)("Messages", messageSchema);
