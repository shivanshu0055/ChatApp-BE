import { Mongoose, Schema } from "mongoose";
import { model } from "mongoose";

const userSchema=new Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    friends:[{type:Schema.Types.ObjectId,ref:'Users'}],
    receivedRequests:[{type:Schema.Types.ObjectId,ref:'FriendRequests'}],
    sentRequests:[{type:Schema.Types.ObjectId,ref:'FriendRequests'}],
})


const friendRequestSchema=new Schema({
    senderID:{type:Schema.Types.ObjectId,ref:'Users',required:true},
    receiverID:{type:Schema.Types.ObjectId,ref:'Users',required:true},
    status:{type:String,required:true,default:'Pending'},
},
{
    timestamps:true,
})

const roomSchema=new Schema({
    roomName:{type:String},
    creatorID:{type:Schema.Types.ObjectId,ref:'Users',required:true},
    participants:[{type:Schema.Types.ObjectId,ref:'Users'}],
    isGroupChat:{type:Boolean,required:true,default:false},
    lastMessage:{type:Schema.Types.ObjectId,ref:'Messages'}
},{
    timestamps:true
})

const messageSchema=new Schema({
    userID:{type:Schema.Types.ObjectId,ref:'Users',required:true},
    roomID:{type:Schema.Types.ObjectId,ref:'Rooms',required:true},
    text:{type:String,required:true},
    readBy:[{type:Schema.Types.ObjectId,ref:'Users'}],
    groupChat:{type:Boolean,default:false}
},{
    timestamps:true,
})

export const UserModel = model("Users", userSchema);
export const RoomModel = model("Rooms", roomSchema);
export const MessageModel = model("Messages", messageSchema);
export const FriendRequestModel = model("FriendRequests", friendRequestSchema);