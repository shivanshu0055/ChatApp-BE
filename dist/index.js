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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = require("./Routes/auth.routes");
const user_routes_1 = require("./Routes/user.routes");
const message_routes_1 = require("./Routes/message.routes");
const friend_routes_1 = require("./Routes/friend.routes");
const chat_routes_1 = require("./Routes/chat.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = (0, node_http_1.createServer)(app);
app.use("/api/auth", auth_routes_1.authRouter);
app.use("/api/user", user_routes_1.userRouter);
app.use("/api/message", message_routes_1.messageRouter);
app.use("/api/friend", friend_routes_1.friendRouter);
app.use("/api/chat", chat_routes_1.chatRouter);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
io.use((socket, next) => {
    var _a;
    try {
        const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
        if (!token) {
            return next(new Error("Authentication token missing"));
        }
        if (!process.env.JWT_TOKEN) {
            return next(new Error("JWT secret not configured"));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_TOKEN);
        if (!decoded || typeof decoded === "string") {
            return next(new Error("Invalid token"));
        }
        socket.userID = decoded.userID;
        next();
    }
    catch (err) {
        next(new Error("Authentication failed"));
    }
});
io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id, "User:", socket.userID);
    // ============================================================
    // 1️⃣ USER PERSONAL ROOM (for notifications)
    // ============================================================
    socket.join(`user_${socket.userID}`);
    console.log(`User ${socket.userID} joined personal room user_${socket.userID}`);
    // Notify others that user is online
    io.emit("user-online", { userId: socket.userID });
    // Tell THIS client that socket is ready
    socket.emit("connected");
    // ============================================================
    // 2️⃣ USER JOINS A CHAT ROOM (DM OR GROUP)
    // ============================================================
    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.userID} joined chat room → ${chatId}`);
    });
    // ============================================================
    // 3️⃣ LEAVE CHAT ROOM
    // ============================================================
    socket.on("leave-chat", (chatId) => {
        socket.leave(chatId);
        console.log(`User ${socket.userID} left chat room → ${chatId}`);
    });
    // ============================================================
    // 4️⃣ SEND MESSAGE (DM/GROUP)
    // ============================================================
    socket.on("new-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        // data contains message
        try {
            const { chatID, content } = data;
            // Send real-time message to all inside the chat (except sender)
            socket.to(chatID).emit("message-received", data);
            data === null || data === void 0 ? void 0 : data.participants.forEach((_id) => {
                if (_id.toString() !== socket.userID) {
                    io.to(`user_${_id}`).emit("notify-new-message", data);
                }
            });
        }
        catch (err) {
            console.error("Message error:", err);
        }
    }));
    // ============================================================
    // 5️⃣ DELETE MESSAGE
    // ============================================================
    socket.on("delete-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        // data contains soft deleted message
        io.to(data.chatID).emit("message-deleted", data);
    }));
    // ============================================================
    // 6️⃣ EDIT MESSAGE
    // ============================================================
    socket.on("edit-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        // data contains updated message
        io.to(data.chatID).emit("message-edited", data);
    }));
    // ============================================================
    // 7️⃣ TYPING EVENTS
    // ============================================================
    socket.on("typing", (chatId) => {
        socket.to(chatId).emit("typing", { userId: socket.userID });
    });
    socket.on("stop-typing", (chatId) => {
        socket.to(chatId).emit("stop-typing", { userId: socket.userID });
    });
    socket.on("group-added-user", ({ chatId, userId }) => {
        io.to(chatId).emit("group-added-user", { userId });
        io.to(`user_${userId}`).emit("group-added-user", { chatId });
    });
    socket.on("group-removed-user", ({ chatId, userId }) => {
        io.to(chatId).emit("group-removed-user", { userId });
    });
    socket.on("group-renamed", ({ chatId, newName }) => {
        io.to(chatId).emit("group-renamed", { chatId, newName });
    });
    socket.on("group-deleted", ({ chatId }) => {
        io.to(chatId).emit("group-deleted", { chatId });
    });
    // ============================================================
    // 🎥 WEBRTC VIDEO CALLING EVENTS
    // ============================================================
    // Initiate a call
    socket.on("call-user", ({ to, offer, from, chatID }) => {
        console.log(`📞 Call from ${from} to ${to}`);
        io.to(`user_${to}`).emit("incoming-call", {
            from,
            offer,
            chatID,
            signal: offer
        });
    });
    // Accept the call
    socket.on("call-accepted", ({ to, answer, from }) => {
        console.log(`✅ Call accepted by ${from} to ${to}`);
        io.to(`user_${to}`).emit("call-accepted", {
            answer,
            from
        });
    });
    // Reject the call
    socket.on("call-rejected", ({ to, from }) => {
        console.log(`❌ Call rejected by ${from} to ${to}`);
        io.to(`user_${to}`).emit("call-rejected", {
            from
        });
    });
    // Exchange ICE candidates
    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(`user_${to}`).emit("ice-candidate", {
            candidate,
            from: socket.userID
        });
    });
    // End the call
    socket.on("end-call", ({ to }) => {
        console.log(`📴 Call ended by ${socket.userID} to ${to}`);
        io.to(`user_${to}`).emit("call-ended", {
            from: socket.userID
        });
    });
    // Video toggled (camera on/off)
    socket.on("video-toggled", ({ to, isVideoOff }) => {
        console.log(`📹 Video toggled by ${socket.userID} to ${to}: ${isVideoOff ? 'OFF' : 'ON'}`);
        io.to(`user_${to}`).emit("video-toggled", {
            from: socket.userID,
            isVideoOff
        });
    });
    // ============================================================
    // 🔟 USER DISCONNECT
    // ============================================================
    socket.on("disconnect", () => {
        console.log(`❌ User ${socket.userID} disconnected`);
        io.emit("user-offline", {
            userID: socket.userID,
        });
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGO_URL);
        console.log("Database connected");
        server.listen(3000, () => {
            console.log("Server running on PORT 3000");
        });
    });
}
main();
