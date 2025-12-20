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

const chatSchema = new Schema({
    participants: [
      { type: Schema.Types.ObjectId, ref: "Users", required: true }
    ],
    isGroupChat: { type: Boolean, default: false },
    groupName: { type: String }, 
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Messages"
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: function () {
          return this.isGroupChat;
        }
    }
  }, { timestamps: true });
  
  const messageSchema = new Schema({
    chatID: {
      type: Schema.Types.ObjectId,
      ref: "Chats",
      required: true
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "Users" }]
  }, { timestamps: true });

  
export const UserModel = model("Users", userSchema);
export const ChatModel = model("Chats", chatSchema);
export const MessageModel = model("Messages", messageSchema);
export const FriendRequestModel = model("FriendRequests", friendRequestSchema);