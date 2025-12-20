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
exports.deleteMessage = exports.getMessagesByChatID = exports.sendMessage = void 0;
const DB_1 = require("../DB/DB");
// Send a message in a chat (group or direct)
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.userID;
        const { chatID, content } = req.body;
        if (!chatID || !content) {
            return res.status(400).json({
                error: "chatID and content are required"
            });
        }
        // Check if chat exists
        const chat = yield DB_1.ChatModel.findById(chatID);
        if (!chat) {
            return res.status(404).json({
                error: "Chat not found"
            });
        }
        // Verify user is a participant of the chat
        const isParticipant = chat.participants.some((participant) => participant.toString() === userID);
        if (!isParticipant) {
            return res.status(403).json({
                error: "You are not a participant of this chat"
            });
        }
        // Create and save the message
        const message = yield DB_1.MessageModel.create({
            chatID,
            sender: userID,
            content
        });
        // Update chat's lastMessage and updatedAt
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        yield chat.save();
        const populatedMessage = yield DB_1.MessageModel.findById(message._id)
            .populate("sender", "username")
            .populate("chatID");
        return res.status(200).json({
            message: populatedMessage
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});
exports.sendMessage = sendMessage;
// Version supporting cursor-based pagination suitable for infinite queries
const getMessagesByChatID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatID, cursor } = req.query;
        const userID = req.userID;
        // limit = number of messages per page/batch, default to 20
        let limit = parseInt(req.query.limit) || 20;
        if (limit < 1)
            limit = 1;
        if (!chatID || typeof chatID !== "string") {
            return res.status(400).json({
                error: "chatID query parameter is required",
            });
        }
        // Check if chat exists
        const chat = yield DB_1.ChatModel.findById(chatID);
        if (!chat) {
            return res.status(404).json({
                error: "Chat not found",
            });
        }
        // Verify the user is a participant
        const isParticipant = chat.participants.some((participant) => participant.toString() === userID);
        if (!isParticipant) {
            return res.status(403).json({
                error: "You are not a participant of this chat",
            });
        }
        const query = { chatID };
        // For infinite scroll: fetch messages older than 'cursor'
        // 'cursor' should be a messageId (ObjectId string)
        if (cursor && typeof cursor === "string") {
            query._id = { $lt: cursor }; // Get older messages (before cursor)
        }
        // Find messages in reverse chronological order
        let messages = yield DB_1.MessageModel.find(query)
            .populate("userID")
            .sort({ _id: -1 }) // newest first
            .limit(limit + 1); // fetch one extra to check for next page
        // Determine if there is a next page
        const hasNextPage = messages.length > limit;
        if (hasNextPage) {
            messages = messages.slice(0, limit);
        }
        // Send messages in chronological order (oldest first if desired)
        messages = messages.reverse();
        // For infiniteQuery, provide the nextCursor as the last visible message id (for fetching previous/older)
        const nextCursor = hasNextPage && messages.length > 0 ? messages[0]._id : null;
        return res.status(200).json({
            messages,
            nextCursor, // The client can pass this as "cursor" to fetch older messages
            hasNextPage
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
});
exports.getMessagesByChatID = getMessagesByChatID;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageID } = req.params;
        const userId = req.userID;
        // Find the message by ID
        const message = yield DB_1.MessageModel.findById(messageID);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        // Only the sender can delete their message (add admin logic here if needed)
        if (message.userID.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You cannot delete this message' });
        }
        // Soft delete: update the content
        message.content = "This message is deleted";
        yield message.save();
        return res.status(200).json({
            message: 'Message deleted successfully',
            data: {
                _id: message._id,
                content: message.content
            }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteMessage = deleteMessage;
