import express, { Application, Request, Response } from 'express'
import { log } from 'node:console'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app=express()
app.use(cors())
app.use(express.json())

const server=createServer(app)
import mongoose from 'mongoose'
import { authRouter } from './Routes/auth.routes'
import { userRouter } from './Routes/user.routes'
import { saveMessageDM } from './Controllers/user.controller'
import { MessageModel, RoomModel } from './DB/DB'

declare global {
    namespace Express {
      interface Request {
        userID?:string
      }
    }
  }
  
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

const io = new Server(server, {
    cors: {
      origin: "*"
    }
});
  
app.get("/",(req:Request,res:Response)=>{
    res.send("Hello World")
})

io.on('connection',(socket)=>{

    // initializing
    socket.on("setup",(data)=>{
        socket.join(data.userID)
    })

    // join a room
    socket.on("join-room",async (data)=>{  
        const roomID=data.roomID
        const userID=data.userID
        if(data.convoType=="DM"){
            socket.join(roomID)
            io.to(roomID).emit("announcement",`${userID} has joined roomID ${roomID}`)
            
        }
        else{   
            socket.join(roomID)
            await RoomModel.updateOne(
                {_id:roomID},
                {$addToSet:{participants:userID}}
            )
            io.to(roomID).emit("announcement",`${userID} has joined roomID ${roomID}`)

        }
    })

    // leave a room
    socket.on("leave-room",async (data)=>{  
        const roomID=data.roomID
        const userID=data.userID

        socket.leave(roomID)
        
        await RoomModel.updateOne(
            {_id:roomID},
            {$pull:{participants:userID}}
        )
        io.to(roomID).emit("announcement",`${userID} has left roomID ${roomID}`)

    })

    // send a message
    socket.on("send-message",async (data)=>{
        const roomID=data.roomID
        const senderID=data.userID
        const text=data.text
        await saveMessageDM(senderID,roomID,text)
        io.to(roomID).emit("new-message-noti",data)
    })

    // delete a message
    socket.on("delete-message", async (data) => {
        const roomID=data.roomID
        const senderID=data.userID
        const messageID=data.messageID
        // find message
        const message=await MessageModel.findById(messageID)

        if(!message){
            console.log("Message doesn't exists");
            return
        }

        await MessageModel.deleteOne({
            userID:senderID,
            _id:messageID
        })

        const room=await RoomModel.findById(message.roomID)

        let newLastMessage=room?.lastMessage || null
        
        if(room?.lastMessage?.toString()==messageID){
            const tempLastMessage=await MessageModel.findOne({roomID:message.roomID}).sort({createdAt:-1})
            newLastMessage=tempLastMessage?._id || null
            await RoomModel.updateOne({_id:message.roomID},{lastMessage:newLastMessage})
        }

        io.to(message.roomID.toString()).emit("delete-message-noti",{
            roomID:message.roomID.toString(),
            deletorID:senderID,
            messageID:messageID,
            newLastMessage:newLastMessage
        })

    });


})


async function main(){
    await mongoose.connect(process.env.MONGO_URL as string)
    console.log("Database connected");
    server.listen(3000,()=>{
        console.log("Server running on PORT 3000");
    })
}

main()

