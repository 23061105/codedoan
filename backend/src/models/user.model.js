// Tạo bảng dữ liệu cho user
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    // Friends list - users who are connected
    friends: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    // Incoming friend requests
    friendRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    // Outgoing friend requests
    sentRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
  },
  //Thời gian tạo
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
