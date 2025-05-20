import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // ✅ frontend đang chạy tại đây
    credentials: true
  },
});

// ✅ Bản đồ lưu userId <-> socketId
export const userSocketMap = {};

// ✅ Truy xuất socketId theo userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// 🔄 Khi có kết nối socket mới
io.on("connection", (socket) => {
  console.log("🔌 A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("🟢 Mapped userId", userId, "to socket", socket.id);
  }

  // Gửi danh sách người online cho tất cả client
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✍️ Typing indicator
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

  // ✅ Xử lý read receipts
  socket.on("messageRead", ({ messageId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageRead", { messageId });
    }
  });

  // ❌ Khi người dùng disconnect
  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

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

// ✅ Export cho toàn hệ thống
export { io, app, server };
