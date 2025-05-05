import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createPost,
  getPosts,
  likePost,
  addComment,
  deletePost
} from "../controllers/post.controller.js";

const router = express.Router();

// Create a new post
router.post("/create", protectRoute, createPost);

// Get all posts with pagination
router.get("/", protectRoute, getPosts);

// Like or unlike a post
router.put("/like/:postId", protectRoute, likePost);

// Add a comment to a post
router.post("/comment/:postId", protectRoute, addComment);

// Delete a post
router.delete("/:postId", protectRoute, deletePost);

export default router;