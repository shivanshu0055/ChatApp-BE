import { Mongoose, Schema } from "mongoose";
import { model } from "mongoose";

const userSchema=new Schema({
    username:{type:String,required:true},
    password:{type:String,required:true}
})

const roomSchema=new Schema({
    roomID:{type:String,required:true},
    creatorID:{type:Schema.Types.ObjectId,ref:'Users',required:true}
})

const messageSchema=new Schema({
    userID:{type:Schema.Types.ObjectId,ref:'Users',required:true},
    roomID:{type:Schema.Types.ObjectId,ref:'Rooms',required:true},
    type:{type:String,required:true},
    text:{type:String,required:true},
},{
    timestamps:true,
})

export const UserModel = model("Users", userSchema);
export const RoomModel = model("Rooms", roomSchema);
export const MessageModel = model("Messages", messageSchema);