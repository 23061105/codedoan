import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteUser,
  markMessageAsRead,
} from "../controllers/message.controller.js";

const router = express.Router();
//Tải người dùng
router.get("/users", protectRoute, getUsersForSidebar);
//Tải tin nhắn đến
router.get("/:id", protectRoute, getMessages);
//Gửi tin nhắn
router.post("/send/:id", protectRoute, sendMessage);
//Đánh dấu tin nhắn đã đọc
router.put("/read/:messageId", protectRoute, markMessageAsRead);

router.delete("/:userId", protectRoute, deleteUser);
export default router;
