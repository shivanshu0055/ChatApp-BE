import express, { Application, Request, Response } from 'express'
import { log } from 'node:console'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'

const app=express()
app.use(cors())
app.use(express.json())

const server=createServer(app)
import mongoose from 'mongoose'
import { authRouter } from './Routes/auth.routes'
import { userRouter } from './Routes/user.routes'

declare global {
    namespace Express {
      interface Request {
        userID?:string
      }
    }
  }
  

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

const users=new Map()

const io = new Server(server, {
    cors: {
      origin: "*"
    }
});
  
app.get("/",(req:Request,res:Response)=>{
    res.send("Hello World")
})

io.on('connection',(socket)=>{

    socket.on('join-room',(msg)=>{
        socket.join(msg.roomID)
        users.set(socket.id,msg.username)    
        io.to(msg.roomID).emit("joined-room",{
            socketID:socket.id,
            username:users.get(socket.id)
        })
    })

    socket.on('send-message',(msg)=>{
        io.to(msg.roomID).emit("recieve-message",{
            socketID:socket.id,
            message:msg.message,
            username:users.get(socket.id)
        })
    })

    socket.on('leave-room',(msg)=>{
        socket.leave(msg.roomID)
        io.to(msg.roomID).emit("left-room",{
            socketID:socket.id,
            message:msg.message,
            username:users.get(socket.id)
        })
    })

})


async function main(){

    await mongoose.connect("mongodb+srv://shivanshu192004:mongodb12345@cluster0.ajjuw.mongodb.net/Chat-App")
    console.log("Database connected");
    server.listen(3000,()=>{
        console.log("Server running on PORT 3000");
    })
}

main()

