import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Post must contain text or image" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newPost = new Post({
      userId,
      text,
      image: imageUrl,
      likes: [],
      comments: [],
    });

    await newPost.save();

    // Populate user info
    const populatedPost = await Post.findById(newPost._id).populate({
      path: "userId",
      select: "fullName profilePic",
    });

    res.status(201).json(populatedPost);
  } catch (error) {
    console.log("Error in createPost controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all posts with pagination
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "fullName profilePic",
      })
      .populate({
        path: "comments.userId",
        select: "fullName profilePic",
      });

    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    });
  } catch (error) {
    console.log("Error in getPosts controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Like/Unlike a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    if (post.userId.toString() !== userId.toString()) {
  const receiverSocketId = getReceiverSocketId(post.userId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("postLiked", {
      userName: req.user.fullName
      // Có thể gửi thêm postId: post._id nếu cần sử dụng ở frontend
    });
  }
}
    res.status(200).json({
      liked: !isLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.log("Error in likePost controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add comment to a post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();
      if (post.userId.toString() !== userId.toString()) {
  const receiverSocketId = getReceiverSocketId(post.userId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("postCommented", {
      userName: req.user.fullName 
    });
  }
}
    // Get the populated comment
    const populatedPost = await Post.findById(postId).populate({
      path: "comments.userId",
      select: "fullName profilePic",
    });

    const addedComment =
      populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    console.log("Error in addComment controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // Check if user is the owner of the post
    if (post.userId.toString() !== userId.toString() && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only delete your own posts" });
    }

    // Delete the post image from cloudinary if exists
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
