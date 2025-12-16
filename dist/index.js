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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = (0, node_http_1.createServer)(app);
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = require("./Routes/auth.routes");
const user_routes_1 = require("./Routes/user.routes");
const user_controller_1 = require("./Controllers/user.controller");
const DB_1 = require("./DB/DB");
app.use("/api/auth", auth_routes_1.authRouter);
app.use("/api/user", user_routes_1.userRouter);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
io.on('connection', (socket) => {
    // initializing
    socket.on("setup", (data) => {
        socket.join(data.userID);
    });
    // join a room
    socket.on("join-room", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const roomID = data.roomID;
        const userID = data.userID;
        if (data.convoType == "DM") {
            socket.join(roomID);
            io.to(roomID).emit("announcement", `${userID} has joined roomID ${roomID}`);
        }
        else {
            socket.join(roomID);
            yield DB_1.RoomModel.updateOne({ _id: roomID }, { $addToSet: { participants: userID } });
            io.to(roomID).emit("announcement", `${userID} has joined roomID ${roomID}`);
        }
    }));
    // leave a room
    socket.on("leave-room", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const roomID = data.roomID;
        const userID = data.userID;
        socket.leave(roomID);
        yield DB_1.RoomModel.updateOne({ _id: roomID }, { $pull: { participants: userID } });
        io.to(roomID).emit("announcement", `${userID} has left roomID ${roomID}`);
    }));
    // send a message
    socket.on("send-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const roomID = data.roomID;
        const senderID = data.userID;
        const text = data.text;
        yield (0, user_controller_1.saveMessageDM)(senderID, roomID, text);
        io.to(roomID).emit("new-message-noti", data);
    }));
    // delete a message
    socket.on("delete-message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const roomID = data.roomID;
        const senderID = data.userID;
        const messageID = data.messageID;
        // find message
        const message = yield DB_1.MessageModel.findById(messageID);
        if (!message) {
            console.log("Message doesn't exists");
            return;
        }
        yield DB_1.MessageModel.deleteOne({
            userID: senderID,
            _id: messageID
        });
        const room = yield DB_1.RoomModel.findById(message.roomID);
        let newLastMessage = (room === null || room === void 0 ? void 0 : room.lastMessage) || null;
        if (((_a = room === null || room === void 0 ? void 0 : room.lastMessage) === null || _a === void 0 ? void 0 : _a.toString()) == messageID) {
            const tempLastMessage = yield DB_1.MessageModel.findOne({ roomID: message.roomID }).sort({ createdAt: -1 });
            newLastMessage = (tempLastMessage === null || tempLastMessage === void 0 ? void 0 : tempLastMessage._id) || null;
            yield DB_1.RoomModel.updateOne({ _id: message.roomID }, { lastMessage: newLastMessage });
        }
        io.to(message.roomID.toString()).emit("delete-message-noti", {
            roomID: message.roomID.toString(),
            deletorID: senderID,
            messageID: messageID,
            newLastMessage: newLastMessage
        });
    }));
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
