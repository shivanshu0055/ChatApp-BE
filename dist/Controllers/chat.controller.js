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
exports.leaveGroup = exports.joinGroup = exports.deleteChat = exports.createChat = exports.getGroupList = exports.getChatList = void 0;
const DB_1 = require("../DB/DB");
const getChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const chatList = yield DB_1.ChatModel.find({
        participants: userID,
        isGroupChat: false
    })
        .populate("participants", "username")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    return res.status(200).json({
        "chatList": chatList
    });
});
exports.getChatList = getChatList;
const getGroupList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const groupList = yield DB_1.ChatModel.find({
        participants: userID,
        isGroupChat: true
    })
        .populate("participants", "username")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    return res.status(200).json({
        "groupList": groupList
    });
});
exports.getGroupList = getGroupList;
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const { isGroupChat } = req.body;
    if (isGroupChat) {
        const chat = yield DB_1.ChatModel.create({
            participants: [userID],
            isGroupChat: true,
            groupName: req.body.groupName,
            admin: userID
        });
        res.status(200).json({
            "newChat": chat
        });
    }
    else {
        const { userIDB } = req.body;
        const existingChat = yield DB_1.ChatModel.findOne({
            isGroupChat: false,
            participants: { $all: [userID, userIDB] }
        });
        if (existingChat) {
            return res.status(200).json({ chat: existingChat });
        }
        const chat = yield DB_1.ChatModel.create({
            participants: [userID, userIDB],
            isGroupChat: false,
        });
        res.status(200).json({
            "newChat": chat
        });
    }
});
exports.createChat = createChat;
const deleteChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { chatID } = req.params;
    const userID = req.userID;
    const chat = yield DB_1.ChatModel.findById(chatID);
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }
    if (chat.isGroupChat) {
        if (((_a = chat.admin) === null || _a === void 0 ? void 0 : _a.toString()) != userID) {
            return res.status(403).json({ message: "Not authorized" });
        }
        yield DB_1.MessageModel.deleteMany({
            chatID: chatID
        });
        yield DB_1.ChatModel.findByIdAndDelete(chatID);
        return res.status(200).json({
            message: "Chat deleted"
        });
    }
    else {
        if (!userID ||
            !chat.participants.some((participant) => participant.toString() === userID)) {
            return res.status(403).json({ message: "Not authorized" });
        }
        yield DB_1.MessageModel.deleteMany({
            chatID: chatID
        });
        yield DB_1.ChatModel.findByIdAndDelete(chatID);
        return res.status(200).json({
            message: "Chat deleted"
        });
    }
});
exports.deleteChat = deleteChat;
const joinGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const { chatID } = req.body;
    if (!chatID) {
        return res.status(400).json({ message: "chatID is required" });
    }
    const chat = yield DB_1.ChatModel.findById(chatID);
    if (!chat) {
        return res.status(404).json({ message: "Group not found" });
    }
    if (!chat.isGroupChat) {
        return res.status(400).json({ message: "This is not a group chat" });
    }
    // Check if user is already a participant
    const alreadyMember = chat.participants.some((p) => p.toString() === userID);
    if (alreadyMember) {
        return res.status(400).json({ message: "You are already a member of this group" });
    }
    // Add user to participants
    yield DB_1.ChatModel.findByIdAndUpdate(chatID, {
        $addToSet: { participants: userID }
    });
    const updatedChat = yield DB_1.ChatModel.findById(chatID)
        .populate("participants", "username")
        .populate("admin", "username");
    return res.status(200).json({
        message: "Successfully joined the group",
        group: updatedChat
    });
});
exports.joinGroup = joinGroup;
const leaveGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.userID;
    const { chatID } = req.body;
    if (!chatID) {
        return res.status(400).json({ message: "chatID is required" });
    }
    const chat = yield DB_1.ChatModel.findById(chatID);
    if (!chat) {
        return res.status(404).json({ message: "Group not found" });
    }
    if (!chat.isGroupChat) {
        return res.status(400).json({ message: "This is not a group chat" });
    }
    // If the user is not a participant of the group
    const isParticipant = chat.participants.some((p) => p.toString() === userID);
    if (!isParticipant) {
        return res.status(400).json({ message: "You are not a member of this group" });
    }
    // If the user is the admin, prevent them from leaving (alternatively, admin can assign someone else)
    if (chat.admin && chat.admin.toString() === userID) {
        return res.status(403).json({
            message: "Group admin cannot leave the group. Please assign another admin and try again."
        });
    }
    // Remove user from the participants array
    yield DB_1.ChatModel.findByIdAndUpdate(chatID, {
        $pull: { participants: userID }
    });
    const updatedChat = yield DB_1.ChatModel.findById(chatID)
        .populate("participants", "username")
        .populate("admin", "username");
    return res.status(200).json({
        message: "Successfully left the group",
        group: updatedChat
    });
});
exports.leaveGroup = leaveGroup;
