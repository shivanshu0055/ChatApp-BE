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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = (0, node_http_1.createServer)(app);
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = require("./Routes/auth.routes");
const user_routes_1 = require("./Routes/user.routes");
app.use("/api/auth", auth_routes_1.authRouter);
app.use("/api/user", user_routes_1.userRouter);
const users = new Map();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
app.get("/", (req, res) => {
    res.send("Hello World");
});
io.on('connection', (socket) => {
    socket.on('join-room', (msg) => {
        socket.join(msg.roomID);
        users.set(socket.id, msg.username);
        io.to(msg.roomID).emit("joined-room", {
            socketID: socket.id,
            username: users.get(socket.id)
        });
    });
    socket.on('send-message', (msg) => {
        io.to(msg.roomID).emit("recieve-message", {
            socketID: socket.id,
            message: msg.message,
            username: users.get(socket.id)
        });
    });
    socket.on('leave-room', (msg) => {
        socket.leave(msg.roomID);
        io.to(msg.roomID).emit("left-room", {
            socketID: socket.id,
            message: msg.message,
            username: users.get(socket.id)
        });
    });
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb+srv://shivanshu192004:mongodb12345@cluster0.ajjuw.mongodb.net/Chat-App");
        console.log("Database connected");
        server.listen(3000, () => {
            console.log("Server running on PORT 3000");
        });
    });
}
main();
