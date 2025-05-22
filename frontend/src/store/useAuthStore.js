import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

// 🚀 Lấy danh sách thông báo từ localStorage
const savedNotifications = JSON.parse(
  localStorage.getItem("notifications") || "[]"
);

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  notifications: savedNotifications,

  //Thêm thông báo mới (tránh trùng), lưu vào localStorage, hiển thị toast
  addNotification: (notif) => {
    const existing = get().notifications;

    const alreadyExists = existing.some(
      (n) =>
        n.message === notif.message &&
        Math.abs(new Date(n.time) - new Date(notif.time)) < 2000
    );

    if (alreadyExists) return;

    const updated = [...existing, notif];
    localStorage.setItem("notifications", JSON.stringify(updated));
    set({ notifications: updated });

    toast(notif.message, {
      duration: 4000, // toast tự tắt sau 4 giây
    });
  },

  removeNotification: (index) => {
    const updated = get().notifications.filter((_, i) => i !== index);
    localStorage.setItem("notifications", JSON.stringify(updated));
    set({ notifications: updated });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      // await get().checkAuth();
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();

    if (!authUser) return;

    // ❌ Ngắt kết nối socket cũ và gỡ toàn bộ listener để tránh trùng
    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    /**
     * Socket event handlers for friend functionality
     *
     * These event listeners are set up in the auth store rather than the friend store
     * because:
     * 1. The socket connection is managed here
     * 2. This ensures friend events are handled even when not on friend-related pages
     * 3. Provides app-wide real-time notifications for friend events
     */

    // Dynamic import of friend store to prevent circular dependencies
    const friendStore = () => {
      try {
        return require("./useFriendStore").useFriendStore.getState();
      } catch (error) {
        console.error("Error importing friend store:", error);
        return null;
      }
    };

    // Listen for incoming friend requests from other users
    // This updates the UI in real-time when someone sends you a request
    socket.on("friendRequest", (request) => {
      const fs = friendStore();
      if (fs && fs.handleNewFriendRequest) {
        fs.handleNewFriendRequest(request);
      }
    });

    // Listen for notifications when someone accepts your friend request
    // This updates your friends list immediately when they accept
    socket.on("friendRequestAccepted", (user) => {
      const fs = friendStore();
      if (fs && fs.handleFriendRequestAccepted) {
        fs.handleFriendRequestAccepted(user);
      }
    });

    // Listen for notifications when someone removes you from their friends
    // This keeps both users' friend lists in sync in real-time
    socket.on("friendRemoved", (data) => {
      const fs = friendStore();
      if (fs && fs.handleFriendRemoved) {
        fs.handleFriendRemoved(data);
      }
    });

    socket.on("postLiked", ({ userName }) => {
      get().addNotification({
        message: `${userName} đã thích bài viết của bạn`,
        time: new Date().toISOString(),
        type: "like",
      });
    });

    socket.on("postCommented", ({ userName }) => {
      get().addNotification({
        message: `${userName} đã bình luận bài viết của bạn`,
        time: new Date().toISOString(),
        type: "comment",
      });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      // Remove all event listeners
      socket.off("getOnlineUsers");
      socket.off("friendRequest");
      socket.off("friendRequestAccepted");
      socket.off("friendRemoved");
      socket.disconnect();
    }
  },
}));
