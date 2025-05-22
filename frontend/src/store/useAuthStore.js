import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useFriendStore } from "./useFriendStore"; // Import useFriendStore here

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
const savedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      //Thiết lập trạng thái người dùng
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

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

  //Có thông báo mới → bật flag
  localStorage.setItem("has_unseen_notifications", "true");
  localStorage.setItem("notifications", JSON.stringify(updated));

  set({ notifications: updated });

  toast(notif.message, {
    duration: 4000,
  });
},

clearAllNotifications: () => {
  localStorage.removeItem("notifications");

  // ✅ Đánh dấu là đã xem
  localStorage.setItem("has_unseen_notifications", "false");

  set({ notifications: [] });
},


  removeNotification: (index) => {
    const updated = get().notifications.filter((_, i) => i !== index);
    localStorage.setItem("notifications", JSON.stringify(updated));
    set({ notifications: updated });
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
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
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
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("postLiked", ({ userName }) => {
      get().addNotification({
        message: `${userName} đã thích bài viết của bạn`,
        time: new Date().toISOString(),
        type: "like",
      });
    });    socket.on("postCommented", ({ userName }) => {
      get().addNotification({
        message: `${userName} đã bình luận bài viết của bạn`,
        time: new Date().toISOString(),
        type: "comment",
      });
    }); 

    // Friend request notifications
    socket.on("friendRequest", ({ from, fromId, refreshFriends }) => {
      get().addNotification({
        message: `${from} sent you a friend request`,
        time: new Date().toISOString(),
        type: "friendRequest",
        fromId,
      });
      
      // Refresh friend requests list if needed
      if (refreshFriends) {
        const { fetchRequests } = useFriendStore.getState();
        if (fetchRequests) {
          fetchRequests();
        }
      }
    });
      socket.on("friendAccepted", ({ by, byId, refreshFriends }) => {
      get().addNotification({
        message: `${by} accepted your friend request`,
        time: new Date().toISOString(),
        type: "friendAccepted",
        byId,
      });
      
      // Trigger friend list refresh
      const { fetchFriends, fetchSentRequests } = useFriendStore.getState();
      if (fetchFriends) {
        fetchFriends();
        fetchSentRequests();
      }
    });
    
    // Listen for friend removal notification
    socket.on("friendRemoved", ({ by, byId, refreshFriends }) => {
      get().addNotification({
        message: `${by} removed you from their friends list`,
        time: new Date().toISOString(),
        type: "friendRemoved",
        byId,
      });
      
      // Trigger friend list refresh in the FriendStore
      if (refreshFriends) {
        const { fetchFriends } = useFriendStore.getState();
        if (fetchFriends) {
          fetchFriends();
        }
      }
    });
    
    // Listen for request cancellation
    socket.on("requestCanceled", ({ by, byId, refreshFriends }) => {
      get().addNotification({
        message: `${by} canceled their friend request`,
        time: new Date().toISOString(),
        type: "requestCanceled",
        byId,
      });
      
      // Refresh requests if needed
      if (refreshFriends) {
        const { fetchRequests } = useFriendStore.getState();
        if (fetchRequests) {
          fetchRequests();
        }
      }
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
      socket.removeAllListeners();
      socket.disconnect();
    }
  },

      clearAllNotifications: () => {
  localStorage.removeItem("notifications");
  set({ notifications: [] });
},


}));
