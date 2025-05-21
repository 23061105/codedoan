// filepath: d:\AppFull\codedoan\backend\src\routes\friend.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  sendRequest, 
  respondRequest, 
  removeFriend, 
  getFriends, 
  getRequests,
  getSentRequests
} from "../controllers/friend.controller.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Friend management routes
router.post("/send", sendRequest);
router.post("/respond", respondRequest);
router.post("/remove", removeFriend);
router.get("/list", getFriends);
router.get("/requests", getRequests);
router.get("/sent", getSentRequests);

export default router;
