import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const fromId = req.user._id;
    const toId = req.params.id;

    // Check if user is trying to friend themselves
    if (fromId.equals(toId)) {
      return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const [from, to] = await Promise.all([
      User.findById(fromId),
      User.findById(toId),
    ]);

    if (!to) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already sent or already friends
    if (to.friendRequests.includes(fromId) || to.friends.includes(fromId)) {
      return res.status(400).json({ message: "Request already sent or already friends" });
    }

    // Add to friendRequests and sentRequests
    to.friendRequests.push(fromId);
    from.sentRequests.push(toId);
    await Promise.all([to.save(), from.save()]);    // Send real-time notification if receiver is online
    const socketId = getReceiverSocketId(toId);
    if (socketId) {
      io.to(socketId).emit("friendRequest", { 
        from: from.fullName, 
        fromId,
        refreshFriends: true // Signal to refresh friends list
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const meId = req.user._id;
    const fromId = req.params.id;

    const [me, from] = await Promise.all([
      User.findById(meId),
      User.findById(fromId),
    ]);

    if (!from) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if there's a pending request
    if (!me.friendRequests.includes(fromId)) {
      return res.status(400).json({ message: "No such request exists" });
    }

    // Remove from requests lists
    me.friendRequests = me.friendRequests.filter((id) => !id.equals(fromId));
    from.sentRequests = from.sentRequests.filter((id) => !id.equals(meId));

    // Add to friends lists
    me.friends.push(fromId);
    from.friends.push(meId);

    await Promise.all([me.save(), from.save()]);

    // Send real-time notification if sender is online
    const socketId = getReceiverSocketId(fromId);
    if (socketId) {
      io.to(socketId).emit("friendAccepted", { 
        by: me.fullName, 
        byId: meId,
        refreshFriends: true // Signal to refresh friends list
      });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const meId = req.user._id;
    const fromId = req.params.id;

    const [me, from] = await Promise.all([
      User.findById(meId),
      User.findById(fromId),
    ]);

    if (!from) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if this is a cancellation (sender is canceling their own sent request)
    // In that case, me is the sender and from is the recipient of the original request
    const isMeSender = me.sentRequests.includes(fromId);
    const isFromRecipient = from.friendRequests.includes(meId);
    const isCancel = isMeSender && isFromRecipient;

    // For cancellation: remove from sender's sentRequests and recipient's friendRequests
    // For rejection: remove from recipient's friendRequests and sender's sentRequests
    me.friendRequests = me.friendRequests.filter((id) => !id.equals(fromId));
    me.sentRequests = me.sentRequests.filter((id) => !id.equals(fromId));
    from.friendRequests = from.friendRequests.filter((id) => !id.equals(meId));
    from.sentRequests = from.sentRequests.filter((id) => !id.equals(meId));
    
    await Promise.all([me.save(), from.save()]);    // If this is a cancellation, notify the request recipient that the request was canceled
    if (!isCancel) {
      const socketId = getReceiverSocketId(fromId);
      if (socketId) {
        io.to(socketId).emit("requestCanceled", { 
          by: me.fullName, 
          byId: meId,
          refreshFriends: true // Signal to refresh friends list
        });
      }
    }

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove a friend (unfriend)
export const removeFriend = async (req, res) => {
  try {
    const meId = req.user._id;
    const friendId = req.params.id;

    const [me, friend] = await Promise.all([
      User.findById(meId),
      User.findById(friendId),
    ]);

    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from friends lists
    me.friends = me.friends.filter((id) => !id.equals(friendId));
    friend.friends = friend.friends.filter((id) => !id.equals(meId));
    
    await Promise.all([me.save(), friend.save()]);    // Send real-time notification to the other user to update their friend list
    const socketId = getReceiverSocketId(friendId);
    if (socketId) {
      io.to(socketId).emit("friendRemoved", { 
        by: me.fullName, 
        byId: meId,
        refreshFriends: true // Signal to refresh friends list
      });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get list of friends
export const getFriends = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .populate("friends", "-password")
      .select("friends");
    
    res.status(200).json(me.friends);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get incoming friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .populate("friendRequests", "-password")
      .select("friendRequests");
    
    res.status(200).json(me.friendRequests);
  } catch (error) {
    console.error("Error in getFriendRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get outgoing (sent) friend requests
export const getSentRequests = async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .populate("sentRequests", "-password")
      .select("sentRequests");
    
    res.status(200).json(me.sentRequests);
  } catch (error) {
    console.error("Error in getSentRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
