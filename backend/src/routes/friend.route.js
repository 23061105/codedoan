import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSentRequests
} from "../controllers/friend.controller.js";

const router = express.Router();
router.use(protectRoute);

// Send, accept, decline friend requests and unfriend
router.post("/:id/request", sendFriendRequest);
router.put("/:id/accept", acceptFriendRequest);
router.put("/:id/decline", declineFriendRequest);
router.delete("/:id/unfriend", removeFriend);

// Get lists of friends and requests
router.get("/me", getFriends);
router.get("/requests", getFriendRequests);
router.get("/sent", getSentRequests);

export default router;
