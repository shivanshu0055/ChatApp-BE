import express, { Application, Request, Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { authRouter } from "./Routes/auth.routes";
import { userRouter } from "./Routes/user.routes";
import { messageRouter } from "./Routes/message.routes";
import { MessageModel, ChatModel } from "./DB/DB";
import { friendRouter } from "./Routes/friend.routes";
import { chatRouter } from "./Routes/chat.routes";
import { Socket } from "node:dgram";

dotenv.config();

const app: Application = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

declare global {
  namespace Express {
    interface Request {
      userID?: string;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    userID?: string;
  }
}

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);
app.use("api/friend",friendRouter)
app.use("/api/chat",chatRouter)

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    if (!process.env.JWT_TOKEN) {
      return next(new Error("JWT secret not configured"));
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN) as JwtPayload | string;

    if (!decoded || typeof decoded === "string") {
      return next(new Error("Invalid token"));
    }

    socket.userID = decoded.userID as string;
    next();
  } catch (err) {
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
    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.userID} joined chat room → ${chatId}`);
    });

    // ============================================================
    // 3️⃣ LEAVE CHAT ROOM
    // ============================================================

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${socket.userID} left chat room → ${chatId}`);
    });

    // ============================================================
    // 4️⃣ SEND MESSAGE (DM/GROUP)
    // ============================================================
    
    socket.on("new-message", async (data) => {
      // data contains message
      try {
        const { chatID, content } = data;

        // Send real-time message to all inside the chat (except sender)
        socket.to(chatID).emit("message-received", data);

        data?.participants.forEach((_id: any) => {
          if (_id.toString() !== socket.userID) {
            io.to(`user_${_id}`).emit("notify-new-message", data);
          }
        });
        
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // ============================================================
    // 5️⃣ DELETE MESSAGE
    // ============================================================
    socket.on("delete-message", async (data) => {
      // data contains soft deleted message
      io.to(data.chatID).emit("message-deleted", data);
    });

    // ============================================================
    // 6️⃣ EDIT MESSAGE
    // ============================================================
    socket.on("edit-message", async (data) => {
      // data contains updated message
      io.to(data.chatID).emit("message-edited", data);
    });

    // ============================================================
    // 7️⃣ TYPING EVENTS
    // ============================================================
    socket.on("typing", (chatId: string) => {
      socket.to(chatId).emit("typing", { userId: socket.userID });
    });

    socket.on("stop-typing", (chatId: string) => {
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
    // 🔟 USER DISCONNECT
    // ============================================================
    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.userID} disconnected`);

      io.emit("user-offline", {
        userID: socket.userID,
      });
    });
  });


async function main() {
  await mongoose.connect(process.env.MONGO_URL as string);
  console.log("Database connected");
  server.listen(3000, () => {
    console.log("Server running on PORT 3000");
  });
}

main();