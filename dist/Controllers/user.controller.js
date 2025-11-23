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
exports.deleteMessageByAdmin = exports.deleteMessage = exports.deleteRoom = exports.createRoom = exports.addMessage = exports.getRoomChats = exports.getAllCreatedRooms = void 0;
const DB_1 = require("../DB/DB");
const getAllCreatedRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const createdRooms = yield DB_1.RoomModel.find({
        creatorID: userID
    });
    return res.status(201).json({
        "createdRooms": createdRooms
    });
});
exports.getAllCreatedRooms = getAllCreatedRooms;
const getRoomChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const roomID = req.body.roomID;
    const messages = yield DB_1.MessageModel.find({
        roomID: roomID
    }).populate("userID", "username")
        .sort({ createdAt: 1 });
    res.status(201).json({
        "messages": messages
    });
});
exports.getRoomChats = getRoomChats;
const addMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const roomID = req.body.roomID;
    const text = req.body.text;
    const message = yield DB_1.MessageModel.create({
        roomID: roomID,
        userID: userID,
        type: "message",
        text: text
    });
    res.status(201).json({
        "message": message
    });
});
exports.addMessage = addMessage;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const roomID = req.body.roomID;
    const newRoom = yield DB_1.RoomModel.create({
        roomID: roomID,
        creatorID: userID
    });
    res.status(201).json({
        "newRoom": newRoom
    });
});
exports.createRoom = createRoom;
const deleteRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const roomID = req.body.roomID;
    yield DB_1.RoomModel.deleteOne({
        roomID: roomID
    });
    res.status(201).json({
        "info": "Room deleted successfully"
    });
});
exports.deleteRoom = deleteRoom;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const messageID = req.body.messageID;
    yield DB_1.MessageModel.updateOne({ _id: messageID, userID: userID }, {
        $set: {
            text: "Message has been deleted by user",
            type: "deleted-message",
        },
    });
    res.status(201).json({
        "info": "Room deleted/updated successfully"
    });
});
exports.deleteMessage = deleteMessage;
const deleteMessageByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageID = req.body.messageID;
    const userID = req.userID;
    const roomID = req.body.roomID;
    const room = yield DB_1.RoomModel.findOne({
        roomID: roomID,
        creatorID: userID
    });
    if (!room) {
        res.status(400).json({
            "message": "Your are not the admin"
        });
    }
    yield DB_1.MessageModel.updateOne({ _id: messageID }, {
        $set: {
            text: "Message has been deleted by admin",
            type: "deleted-message",
        },
    });
    res.status(201).json({
        "info": "Message deleted/updated successfully"
    });
});
exports.deleteMessageByAdmin = deleteMessageByAdmin;
