/**
 * Friend Controller
 * 
 * This controller handles all friend-related functionality:
 * - Sending friend requests
 * - Responding to friend requests (accept/decline)
 * - Removing friends
 * - Listing friends and friend requests
 * 
 * It also implements real-time notifications using Socket.io to provide
 * instant updates to users when friend requests are sent, accepted, or
 * when they are removed from someone's friend list.
 */

import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";
import { getReceiverSocketId } from "../lib/socket.js";

/**
 * Send a friend request to another user
 * 
 * @route POST /api/friends/send
 * @param {Object} req.body.toUserId - ID of the user to send request to
 * @returns {Object} New friend request object
 */
export const sendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = req.user._id;

    // Cannot send request to yourself
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    // Check if user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    const isFriend = req.user.friends.includes(toUserId);
    if (isFriend) {
      return res.status(400).json({ message: "Already friends with this user" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: fromUserId, to: toUserId },
        { from: toUserId, to: fromUserId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    // Create new friend request
    const newFriendRequest = new FriendRequest({
      from: fromUserId,
      to: toUserId
    });

    await newFriendRequest.save();    // Send real-time notification using socket.io
    // This is a key part of the friend request feature - it allows users to receive
    // friend requests instantly without refreshing the page
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      const io = req.app.get("io");
      // Emit a 'friendRequest' event to the receiver's socket
      // This event contains details about who sent the request
      io.to(receiverSocketId).emit("friendRequest", {
        requestId: newFriendRequest._id,
        from: {
          _id: req.user._id,
          fullName: req.user.fullName,
          profilePic: req.user.profilePic
        }
      });
    }

    res.status(201).json(newFriendRequest);
  } catch (error) {
    console.log("Error in sendRequest controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Respond to a friend request (accept or decline)
 * 
 * @route POST /api/friends/respond
 * @param {string} req.body.requestId - ID of the friend request
 * @param {boolean} req.body.accept - Whether to accept the request
 * @returns {Object} Response message
 */
export const respondRequest = async (req, res) => {
  try {
    const { requestId, accept } = req.body;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Make sure the request is for the current user
    if (friendRequest.to.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    // If already processed
    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: `Request already ${friendRequest.status}` });
    }

    friendRequest.status = accept ? "accepted" : "declined";
    await friendRequest.save();    // If accepted, update both users' friends lists
    if (accept) {
      // Add each user to the other's friends array using $addToSet to prevent duplicates
      await User.findByIdAndUpdate(
        friendRequest.from,
        { $addToSet: { friends: friendRequest.to } }
      );
      await User.findByIdAndUpdate(
        friendRequest.to,
        { $addToSet: { friends: friendRequest.from } }
      );

      // Send real-time notification to the requester that their request was accepted
      // This enables immediate UI updates on the sender's device
      const requesterSocketId = getReceiverSocketId(friendRequest.from.toString());
      if (requesterSocketId) {
        const io = req.app.get("io");
        // Emit 'friendRequestAccepted' event with user info
        io.to(requesterSocketId).emit("friendRequestAccepted", {
          requestId: friendRequest._id,
          user: {
            _id: req.user._id,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic
          }
        });
      }
    }

    res.status(200).json({ message: `Friend request ${accept ? "accepted" : "declined"}` });
  } catch (error) {
    console.log("Error in respondRequest controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Remove a user from friends list
 * 
 * @route POST /api/friends/remove
 * @param {string} req.body.friendId - ID of the friend to remove
 * @returns {Object} Success message
 */
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    // Check if they are friends
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Not friends with this user" });
    }

    // Update both users' friends lists
    await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } }
    );
    
    await User.findByIdAndUpdate(
      friendId,
      { $pull: { friends: userId } }
    );
    
    // Notify the other user in real-time that they have been removed as a friend
    const receiverSocketId = getReceiverSocketId(friendId);
    if (receiverSocketId) {
      const io = req.app.get("io");
      io.to(receiverSocketId).emit("friendRemoved", { userId: userId.toString() });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.log("Error in removeFriend controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get list of user's friends
 * 
 * @route GET /api/friends/list
 * @returns {Array} List of friends with their profiles
 */
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate("friends", "fullName email profilePic");
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get pending friend requests sent to the current user
 * 
 * @route GET /api/friends/requests
 * @returns {Array} List of pending friend requests with sender info
 */
export const getRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const requests = await FriendRequest.find({
      to: userId,
      status: "pending"
    }).populate("from", "fullName email profilePic");
    
    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getRequests controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get friend requests sent by the current user
 * 
 * @route GET /api/friends/sent
 * @returns {Array} List of sent friend requests with recipient info
 */
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const sentRequests = await FriendRequest.find({
      from: userId,
      status: "pending"
    }).populate("to", "fullName email profilePic");
    
    res.status(200).json(sentRequests);
  } catch (error) {
    console.log("Error in getSentRequests controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
