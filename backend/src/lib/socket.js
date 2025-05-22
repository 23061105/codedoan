import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // frontend đang chạy tại đây
    credentials: true,
  },
});

// Make io available throughout the app
app.set("io", io);

// Bản đồ lưu userId <-> socketId
export const userSocketMap = {};

// Truy xuất socketId theo userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Khi có kết nối socket mới
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("Mapped userId", userId, "to socket", socket.id);
  }

  // Gửi danh sách người online cho tất cả client
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });
  // Handle read receipts
  socket.on("messageRead", ({ messageId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageRead", { messageId });
    }
  });
  /**
   * Friend request real-time notification system
   *
   * This section implements Socket.io event handlers for all friend-related actions.
   * These handlers enable real-time updates to users when:
   * 1. They receive a new friend request
   * 2. Their friend request is accepted
   * 3. They are removed from someone's friend list
   */

  // Listen for when a user sends a friend request to another user
  socket.on("friendRequest", ({ receiverId, request }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      // Notify recipient about the new friend request in real-time
      io.to(receiverSocketId).emit("friendRequest", request);
    }
  });

  // Listen for when a user accepts a friend request
  socket.on("friendRequestAccepted", ({ receiverId, user }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      // Notify the original requester that their request was accepted
      io.to(receiverSocketId).emit("friendRequestAccepted", user);
    }
  });

  // Listen for when a user removes someone from their friends list
  socket.on("friendRemoved", ({ receiverId, userId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      // Notify the removed user about the friendship termination
      // This allows for immediate UI updates on both users' devices
      io.to(receiverSocketId).emit("friendRemoved", { userId });
    }
  });

  // Khi người dùng disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Xóa userId khỏi userSocketMap
    for (const [userId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export cho toàn hệ thống
export { io, app, server };
